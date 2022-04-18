import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import {
  MarxanExecutionMetadataFolderType,
  getMarxanExecutionMetadataFolderRelativePath,
  MarxanExecutionMetadataContent,
  MarxanExecutionMetadataElement,
} from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { extractFile, extractFiles } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
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

  private async getExportFileFromFileRepo(uri: string): Promise<Readable> {
    const readableOrError = await this.fileRepository.get(uri);
    if (isLeft(readableOrError)) {
      const errorMessage = `Export file is not available at ${uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return readableOrError.right;
  }

  private async getMetadataFolders(
    exportFileUri: string,
    marxanExecutionMetadata: MarxanExecutionMetadataElement[],
    foldersZipsRelativePathPrefix: string,
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
            foldersZipsRelativePathPrefix,
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
            foldersZipsRelativePathPrefix,
          ),
        });

      return relativePaths;
    });

    const exportFile = await this.getExportFileFromFileRepo(exportFileUri);

    const buffersOrErrors = await extractFiles(
      exportFile,
      foldersData.map((data) => data.relativePath),
    );

    if (isLeft(buffersOrErrors)) {
      const errorMessage = `Error extracting input and output folders of marxan execution metadata`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    foldersData.forEach((data) => {
      const buffer = buffersOrErrors.right[data.relativePath];

      if (!buffer) {
        const errorMessage = `Error extracting ${data.type} folder of execution metadata with id ${data.id}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      metadataFoldersBuffers[`${data.id}-${data.type}`] = buffer;
    });

    return metadataFoldersBuffers;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, projectId, pieceResourceId: scenarioId } = input;

    const marxanExecutionMetadataRepo = this.entityManager.getRepository(
      MarxanExecutionMetadataGeoEntity,
    );

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [marxanExecutionMetadataLocation] = uris;

    const exportFile = await this.getExportFileFromFileRepo(
      marxanExecutionMetadataLocation.uri,
    );

    const marxanExecutionMetadataOrError = await extractFile(
      exportFile,
      marxanExecutionMetadataLocation.relativePath,
    );
    if (isLeft(marxanExecutionMetadataOrError)) {
      const errorMessage = `Marxan execution metadata file extraction failed: ${marxanExecutionMetadataLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const {
      marxanExecutionMetadata,
    }: MarxanExecutionMetadataContent = JSON.parse(
      marxanExecutionMetadataOrError.right,
    );

    const buffers = await this.getMetadataFolders(
      marxanExecutionMetadataLocation.uri,
      marxanExecutionMetadata,
      marxanExecutionMetadataLocation.relativePath,
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
