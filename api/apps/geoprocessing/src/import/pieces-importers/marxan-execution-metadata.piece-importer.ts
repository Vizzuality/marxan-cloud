import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocationSnapshot } from '@marxan/cloning/domain';
import {
  getMarxanExecutionMetadataFolderRelativePath,
  MarxanExecutionMetadataContent,
  MarxanExecutionMetadataElement,
  MarxanExecutionMetadataFolderType,
} from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { dirname } from 'path';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

type FolderData = {
  id: string;
  relativePath: string;
  type: MarxanExecutionMetadataFolderType;
};

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
    marxanExecutionMetadata: MarxanExecutionMetadataElement[],
    componentLocation: ComponentLocationSnapshot,
  ): Promise<MetadataFolderBuffers> {
    const metadataFoldersBuffers: MetadataFolderBuffers = {};
    const foldersData = marxanExecutionMetadata.flatMap((metadata) => {
      const relativePaths: FolderData[] = [
        {
          id: metadata.id,
          type: 'input',
          relativePath: getMarxanExecutionMetadataFolderRelativePath(
            metadata.id,
            'input',
            componentLocation.relativePath,
          ),
        },
      ];

      if (metadata.includesOutputFolder)
        relativePaths.push({
          id: metadata.id,
          type: 'output',
          relativePath: getMarxanExecutionMetadataFolderRelativePath(
            metadata.id,
            'output',
            componentLocation.relativePath,
          ),
        });

      return relativePaths;
    });
    const buffers: MetadataFolderBuffers = {};

    await Promise.all(
      foldersData.map(async (data) => {
        const path = componentLocation.uri.replace(
          componentLocation.relativePath,
          data.relativePath,
        );
        const readableOrError = await this.fileRepository.get(path);

        if (isLeft(readableOrError)) {
          const errorMessage = `Error obtaining ${data.type} folder metadata for execution ${data.id}`;
          this.logger.error(errorMessage);
          throw new Error(errorMessage);
        }

        buffers[data.relativePath] = await readableToBuffer(
          readableOrError.right,
        );
      }),
    );

    foldersData.forEach((data) => {
      const buffer = buffers[data.relativePath];

      if (!buffer) {
        const errorMessage = `${data.type} folder metadata for execution ${data.id} not found`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      metadataFoldersBuffers[`${data.id}-${data.type}`] = buffer;
    });

    return metadataFoldersBuffers;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, projectId, pieceResourceId: scenarioId, piece } = input;

    const marxanExecutionMetadataRepo = this.entityManager.getRepository(
      MarxanExecutionMetadataGeoEntity,
    );

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [marxanExecutionMetadataLocation] = uris;

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

    const buffers = await this.getMetadataFolders(
      marxanExecutionMetadata,
      marxanExecutionMetadataLocation,
    );

    await marxanExecutionMetadataRepo.save(
      marxanExecutionMetadata.map((metadata) => ({
        scenarioId,
        stdOutput: metadata.stdOutput,
        stdError: metadata.stdError,
        inputZip: buffers[`${metadata.id}-input`],
        outputZip: buffers[`${metadata.id}-output`],
        failed: metadata.failed,
      })),
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
