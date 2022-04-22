import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocationSnapshot } from '@marxan/cloning/domain';
import {
  isMarxanExecutionMetadataFolderRelativePath,
  MarxanExecutionMetadataContent,
  MarxanExecutionMetadataFolderType,
  marxanExecutionMetadataRelativePath,
} from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

type MetadataFolderBuffers = Record<string, Buffer>;

@Injectable()
@PieceImportProvider()
export class MarxanExecutionMetadataPieceImporter
  implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MarxanExecutionMetadataPieceImporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.MarxanExecutionMetadata;
  }

  private async getMetadataFolders(
    locations: ComponentLocationSnapshot[],
  ): Promise<MetadataFolderBuffers> {
    const buffers: MetadataFolderBuffers = {};

    await Promise.all(
      locations.map(async (location) => {
        const readableOrError = await this.fileRepository.get(location.uri);
        const result = isMarxanExecutionMetadataFolderRelativePath(
          location.relativePath,
        );

        if (!result) {
          const errorMessage = `Invalid marxan execution metadata folder relative path: ${location.relativePath}`;
          this.logger.error(errorMessage);
          throw new Error(errorMessage);
        }

        const { executionId, type } = result;

        if (isLeft(readableOrError)) {
          const errorMessage = `Error obtaining ${type} folder metadata for execution ${executionId}`;
          this.logger.error(errorMessage);
          throw new Error(errorMessage);
        }

        const buffer = await readableToBuffer(readableOrError.right);

        buffers[`${executionId}-${type}`] = buffer;
      }),
    );

    return buffers;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, projectId, pieceResourceId: scenarioId, piece } = input;

    const marxanExecutionMetadataLocation = uris.find((uri) =>
      uri.relativePath.includes(marxanExecutionMetadataRelativePath),
    );

    if (!marxanExecutionMetadataLocation) {
      const errorMessage = `uris array does not contain ${marxanExecutionMetadataRelativePath} uri`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const readableOrError = await this.fileRepository.get(
      marxanExecutionMetadataLocation.uri,
    );
    if (isLeft(readableOrError)) {
      const errorMessage = `File with piece data for ${piece}/${scenarioId} is not available at ${marxanExecutionMetadataLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const buffer = await readableToBuffer(readableOrError.right);
    const stringMarxanExecutionMetadata = buffer.toString();

    const {
      marxanExecutionMetadata,
    }: MarxanExecutionMetadataContent = JSON.parse(
      stringMarxanExecutionMetadata,
    );

    const foldersUris = uris.filter(
      (uri) =>
        uri.relativePath !== marxanExecutionMetadataLocation.relativePath,
    );

    const buffers = await this.getMetadataFolders(foldersUris);

    await this.entityManager
      .getRepository(MarxanExecutionMetadataGeoEntity)
      .save(
        marxanExecutionMetadata.map((metadata) => {
          const inputZip = buffers[`${metadata.id}-input`];
          const outputZip = buffers[`${metadata.id}-output`];

          if (!inputZip) {
            const errorMessage = `uris array doesn't contain uri for metadata input folder for execution ${metadata.id}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
          }
          if (metadata.includesOutputFolder && !outputZip) {
            const errorMessage = `uris array doesn't contain uri for metadata output folder for execution ${metadata.id}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
          }

          return {
            scenarioId,
            stdOutput: metadata.stdOutput,
            stdError: metadata.stdError,
            inputZip,
            outputZip,
            failed: metadata.failed,
          };
        }),
      );

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId: scenarioId,
      projectId,
      piece: input.piece,
    };
  }
}
