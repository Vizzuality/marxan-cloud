import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocationSnapshot } from '@marxan/cloning/domain';
import {
  isMarxanExecutionMetadataFolderRelativePath,
  MarxanExecutionMetadataContent,
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
  private readonly logger: Logger = new Logger(
    MarxanExecutionMetadataPieceImporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

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

    try {
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
          marxanExecutionMetadata
            /**
             * The original implementation threw errors if we didn't have the
             * input folder for a given Marxan run (execution) or if we didn't
             * have the output folder while the metadata said we should have it.
             *
             * I am not entirely sure about the rationale for that, looking back
             * at this now: I think we can "just" skip any Marxan runs for which
             * we may have metadata in `marxanExecutionMetadata`, but no
             * corresponding input or output folders. In practice we only show in
             * the app the solutions of the latest Marxan run, so importing (and
             * before that, exporting) metadata of previous runs may not be useful
             * in practice.
             *
             * So I think we can ignore marxan execution metadata rows with
             * missing input/output folders: I am not sure why we would have any
             * metadata for a Marxan run _but_ no related input or output folders,
             * as these are stored alongside run metadata in the
             * `(geodb)marxan_execution_metadata` table, but nevertheless, this
             * was a real issue until we introduced this filter, leading to some
             * imports to fail, where they would have been otherwise fully valid
             * (moreover, the marxan run metadata that _did_ import even after
             * adding this filter was enough to show solutions).
             *
             * In practice this may be an issue only if force-importing on an
             * instance Marxan projects that have been exported from another
             * instance (this would only be possible at all if sharing the signing
             * key between the two instances, which should only be done on
             * development instances for triaging purposes, and if the export
             * makes no reference to platform-wide features or protected areas).
             *
             * The worst that may happen is that a scenario is imported without
             * marxan run metadata, leading to having to re-run Marxan.
             *
             * @debt Review this once the export/import flow is thoroughly tested
             * and blessed as stable - we may then remove again the filter and
             * restore the original, stricter erroring out in case of unexpectedly
             * missing data ()
             */
            .filter((metadata) => {
              const inputZip = buffers[`${metadata.id}-input`];
              const outputZip = buffers[`${metadata.id}-output`];

              if (!inputZip) {
                this.logger.warn(
                  `uris array doesn't contain uri for metadata input folder for execution ${metadata.id}`,
                );
              }
              if (metadata.includesOutputFolder && !outputZip) {
                this.logger.warn(
                  `uris array doesn't contain uri for metadata output folder for execution ${metadata.id}`,
                );
              }

              return (
                inputZip && (metadata.includesOutputFolder ? outputZip : true)
              );
            })
            .map((metadata) => {
              const inputZip = buffers[`${metadata.id}-input`];
              const outputZip = buffers[`${metadata.id}-output`];

              /**
               * @debt These checks should never trigger an exception as long as
               * the filter above is in place. See comment about the filter for
               * full rationale.
               *
               * These checks are left here so that if going back to stricter
               * checks in the future, all that will be needed will be removing
               * the filter above.
               */
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
          { chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS },
        );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId: scenarioId,
      projectId,
      piece: input.piece,
    };
  }
}
