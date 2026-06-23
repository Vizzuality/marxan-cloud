import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ResourceKind } from '@marxan/cloning/domain';
import {
  FeatureAmountPerPlanningUnit,
  ProjectFeatureGeoOperation,
} from '@marxan/cloning/infrastructure/clone-piece-data/project-feature-amounts-per-planning-unit';
import { FeatureAmountsPerPlanningUnitEntity } from '@marxan/feature-amounts-per-planning-unit';
import { SpecificationOperation } from '@marxan/specification';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { batch as groupIntoBatches } from 'stream-json/utils/Batch';
import { EntityManager, Repository } from 'typeorm';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

type FeatureSelectResult = {
  id: string;
  feature_class_name: string;
};

// Cross-batch feature-name -> id caches (few distinct features per project).
type FeatureIdByNameCache = Record<string, string>;

@Injectable()
@PieceImportProvider()
export class ProjectFeatureAmountsPerPlanningUnitPieceImporter
  implements ImportPieceProcessor
{
  private readonly logger: Logger = new Logger(
    ProjectFeatureAmountsPerPlanningUnitPieceImporter.name,
  );

  // Default to the prod chunk size; overridable in tests to exercise the
  // multi-batch streaming path with small fixtures. See MRXNM-101.
  private batchSize: number = CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS;

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectRepository(ProjectsPuEntity)
    private readonly projectPusRepo: Repository<ProjectsPuEntity>,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectFeatureAmountsPerPlanningUnit &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, pieceResourceId, projectId, piece } = input;

    try {
      if (uris.length !== 1) {
        const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }
      const { uri } = uris[0];

      const notAvailable = `File with piece data for ${piece}/${pieceResourceId} is not available at ${uri}`;

      // Small side: the derived-feature geo operations array. Stream-picked
      // from the same file so the (large) featureAmountsPerPlanningUnit array
      // is never buffered or synchronously JSON.parse'd. See MRXNM-101.
      const geoOpsReadableOrError = await this.fileRepository.get(uri);
      if (isLeft(geoOpsReadableOrError)) {
        this.logger.error(notAvailable);
        throw new Error(notAvailable);
      }
      const projectFeaturesGeoOperations =
        await this.collectProjectFeaturesGeoOperations(
          geoOpsReadableOrError.right,
        );
      const parsedProjectFeaturesGeoOperations =
        await this.parseProjectFeaturesGeoOperations(
          projectFeaturesGeoOperations,
          projectId,
        );

      // puid -> projectPuId, resolved once (bounded by project PU count).
      const projectPusByPuid = await this.getProjectPusByPuid(projectId);

      await this.geoEntityManager.transaction(async (em) => {
        const amountsReadableOrError = await this.fileRepository.get(uri);
        if (isLeft(amountsReadableOrError)) {
          this.logger.error(notAvailable);
          throw new Error(notAvailable);
        }

        await this.importFeatureAmounts(
          em,
          amountsReadableOrError.right,
          projectId,
          projectPusByPuid,
        );

        await this.apiEntityManager.transaction(async (apiEm) => {
          await Promise.all(
            parsedProjectFeaturesGeoOperations.map(
              ({ featureId, geoOperation }) =>
                apiEm
                  .createQueryBuilder()
                  .update('features')
                  .set({ from_geoprocessing_ops: geoOperation })
                  .where('id = :featureId', { featureId })
                  .execute(),
            ),
          );
        });
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId,
      projectId,
      piece: input.piece,
    };
  }

  /**
   * Stream-reads the (small) `projectFeaturesGeoOperations` array, ignoring the
   * large `featureAmountsPerPlanningUnit` array tokens, so it is never buffered.
   */
  private async collectProjectFeaturesGeoOperations(
    readable: Readable,
  ): Promise<ProjectFeatureGeoOperation[]> {
    const operations: ProjectFeatureGeoOperation[] = [];
    await pipeline(
      readable,
      parser(),
      pick({ filter: 'projectFeaturesGeoOperations' }),
      streamArray(),
      async (source: AsyncIterable<{ value: ProjectFeatureGeoOperation }>) => {
        for await (const { value } of source) operations.push(value);
      },
    );
    return operations;
  }

  /**
   * Streams the (potentially hundreds of MB) `featureAmountsPerPlanningUnit`
   * array out of the clone file and inserts it batch by batch: the whole file
   * is never buffered or `JSON.parse`d at once, and `for await` over the batch
   * stage applies backpressure (parsing pauses while a batch is inserted) so
   * the event loop stays responsive. Feature ids are resolved with a
   * cross-batch cache, so each distinct feature is looked up once. See
   * MRXNM-101 (same approach as MRXNM-94 for scenario-features-data).
   */
  private async importFeatureAmounts(
    em: EntityManager,
    readable: Readable,
    projectId: string,
    projectPusByPuid: Record<number, string>,
  ): Promise<void> {
    const repo = em.getRepository(FeatureAmountsPerPlanningUnitEntity);
    const customFeaturesMap: FeatureIdByNameCache = {};
    const platformFeaturesMap: FeatureIdByNameCache = {};

    await pipeline(
      readable,
      parser(),
      pick({ filter: 'featureAmountsPerPlanningUnit' }),
      streamArray(),
      groupIntoBatches({ batchSize: this.batchSize }),
      async (
        batches: AsyncIterable<{ value: FeatureAmountPerPlanningUnit }[]>,
      ) => {
        for await (const items of batches) {
          const rows = items.map(({ value }) => value);

          await this.resolveFeatureIdsForBatch(
            rows,
            projectId,
            customFeaturesMap,
            platformFeaturesMap,
          );

          const insertValues = rows.map(
            ({ isCustom, featureName, amount, puid }) => ({
              amount,
              projectPuId: projectPusByPuid[puid],
              featureId: isCustom
                ? customFeaturesMap[featureName]
                : platformFeaturesMap[featureName],
              projectId,
            }),
          );

          await repo.save(insertValues, {
            chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
          });
        }
      },
    );
  }

  /**
   * Resolves the feature id for every feature name referenced by the batch,
   * populating the cross-batch caches. Only names not already cached are
   * queried.
   */
  private async resolveFeatureIdsForBatch(
    batch: FeatureAmountPerPlanningUnit[],
    projectId: string,
    customFeaturesMap: FeatureIdByNameCache,
    platformFeaturesMap: FeatureIdByNameCache,
  ): Promise<void> {
    const missingCustom = new Set<string>();
    const missingPlatform = new Set<string>();

    for (const { isCustom, featureName } of batch) {
      const map = isCustom ? customFeaturesMap : platformFeaturesMap;
      const missing = isCustom ? missingCustom : missingPlatform;
      if (map[featureName] === undefined) missing.add(featureName);
    }

    if (missingCustom.size > 0)
      Object.assign(
        customFeaturesMap,
        await this.getCustomFeaturesByFeatureName(
          Array.from(missingCustom),
          projectId,
        ),
      );

    if (missingPlatform.size > 0)
      Object.assign(
        platformFeaturesMap,
        await this.getPlatformFeaturesByFeatureName(
          Array.from(missingPlatform),
        ),
      );
  }

  private async getCustomFeaturesByFeatureName(
    customFeaturesNames: string[],
    projectId: string,
  ) {
    if (!customFeaturesNames.length) return {};

    const features: FeatureSelectResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id, feature_class_name')
      .from('features', 'f')
      .where('feature_class_name IN (:...customFeaturesNames)', {
        customFeaturesNames,
      })
      .andWhere('project_id = :projectId', { projectId })
      .execute();

    const res: Record<string, string> = {};

    return features.reduce((prev, { feature_class_name, id }) => {
      prev[feature_class_name] = id;
      return prev;
    }, res);
  }

  private async getPlatformFeaturesByFeatureName(
    platformFeaturesNames: string[],
  ) {
    if (!platformFeaturesNames.length) return {};

    const features: FeatureSelectResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id, feature_class_name')
      .from('features', 'f')
      .where('feature_class_name IN (:...platformFeaturesNames)', {
        platformFeaturesNames,
      })
      .andWhere('project_id IS NULL')
      .execute();

    const res: Record<string, string> = {};

    return features.reduce((prev, { feature_class_name, id }) => {
      prev[feature_class_name] = id;
      return prev;
    }, res);
  }

  private async getProjectPusByPuid(projectId: string) {
    const projectPus = await this.projectPusRepo.find({ where: { projectId } });
    const projectPusById: Record<number, string> = {};

    projectPus.reduce((prev, { id, puid }) => {
      prev[puid] = id;
      return prev;
    }, projectPusById);

    return projectPusById;
  }

  private async parseProjectFeaturesGeoOperations(
    projectFeaturesGeoOperations: ProjectFeatureGeoOperation[],
    projectId: string,
  ) {
    const projectFeaturestNames = projectFeaturesGeoOperations.map(
      ({ featureName }) => featureName,
    );

    const projectFeaturesByName = await this.getCustomFeaturesByFeatureName(
      projectFeaturestNames,
      projectId,
    );

    const splitOperationsFeatures: {
      featureName: string;
      isCustom: boolean;
    }[] = [];

    projectFeaturesGeoOperations.forEach(({ geoOperation }) => {
      if (geoOperation.operation === SpecificationOperation.Split) {
        splitOperationsFeatures.push({
          featureName: geoOperation.baseFeatureName,
          isCustom: geoOperation.baseFeatureIsCustom,
        });
      }
    });

    const customSplitOperationsFeaturesMap =
      await this.getCustomFeaturesByFeatureName(
        splitOperationsFeatures
          .filter(({ isCustom }) => isCustom)
          .map(({ featureName }) => featureName),
        projectId,
      );

    const platformSplitOperationsFeaturesMap =
      await this.getPlatformFeaturesByFeatureName(
        splitOperationsFeatures
          .filter(({ isCustom }) => !isCustom)
          .map(({ featureName }) => featureName),
      );

    return projectFeaturesGeoOperations
      .filter(
        ({ geoOperation }) =>
          geoOperation.operation === SpecificationOperation.Split,
      )
      .map(({ featureName, geoOperation }) => {
        const featureId = projectFeaturesByName[featureName];
        const baseFeatureName = geoOperation.baseFeatureName;
        const baseFeatureId = geoOperation.baseFeatureIsCustom
          ? customSplitOperationsFeaturesMap[baseFeatureName]
          : platformSplitOperationsFeaturesMap[baseFeatureName];
        return {
          featureId,
          geoOperation: {
            operation: geoOperation.operation,
            value: geoOperation.value,
            splitByProperty: geoOperation.splitByProperty,
            baseFeatureId,
          },
        };
      });
  }
}
