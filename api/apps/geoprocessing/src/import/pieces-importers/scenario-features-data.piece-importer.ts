import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { FeatureDataElement } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-data';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { batch as groupIntoBatches } from 'stream-json/utils/Batch';
import { DeepPartial, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

type FeatureIdByClassNameMap = Record<string, string>;

type FeatureIdByClassNameMaps = {
  customFeaturesMap: FeatureIdByClassNameMap;
  platformFeaturesMap: FeatureIdByClassNameMap;
};

type FeatureDataIdByFeatureIdAndHashMap = Record<string, string>;

type FeatureDataSelectResult = {
  featureDataId: string;
  featureId: string;
  hash: string;
};

type FeatureSelectResult = {
  id: string;
  feature_class_name: string;
};

// Cross-batch lookup caches: each distinct feature / feature-data id is
// resolved once and reused by every later batch that references it.
type FeatureLookupCaches = {
  customFeaturesMap: FeatureIdByClassNameMap;
  platformFeaturesMap: FeatureIdByClassNameMap;
  featureDataIdByFeatureIdAndHash: FeatureDataIdByFeatureIdAndHashMap;
};

@Injectable()
@PieceImportProvider()
export class ScenarioFeaturesDataPieceImporter implements ImportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ScenarioFeaturesDataPieceImporter.name,
  );

  // Default to the prod chunk size; overridable in tests to exercise the
  // multi-batch streaming path with small fixtures. See MRXNM-94.
  private batchSize: number = CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS;

  // The geo features_data table name is invariant; resolve it once (lazily, so
  // it never races entity-metadata initialisation at construction time).
  private cachedFeaturesDataTable?: string;
  private get featuresDataTable(): string {
    return (this.cachedFeaturesDataTable ??=
      this.geoEntityManager.getRepository(
        GeoFeatureGeometry,
      ).metadata.tableName);
  }

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioFeaturesData;
  }

  private ensureFeaturesWereFound(expected: string[], actual: string[]): void {
    const notFound = expected.filter((name) => !actual.includes(name));

    if (notFound.length > 0) {
      throw new Error(`Features not found: ${notFound.join(', ')}`);
    }
  }

  /**
   * Resolves the API feature id for every feature class name referenced by the
   * batch, populating the (cross-batch) name->id caches. Only class names not
   * already cached are queried, so on a large import each distinct feature is
   * looked up once regardless of how many rows reference it.
   */
  private async resolveFeatureIdsForBatch(
    projectId: string,
    batch: FeatureDataElement[],
    customFeaturesMap: FeatureIdByClassNameMap,
    platformFeaturesMap: FeatureIdByClassNameMap,
  ): Promise<void> {
    const missingCustom = new Set<string>();
    const missingPlatform = new Set<string>();

    for (const element of batch) {
      for (const f of [element.apiFeature, element.featureDataFeature]) {
        const map = f.isCustom ? customFeaturesMap : platformFeaturesMap;
        const missing = f.isCustom ? missingCustom : missingPlatform;
        if (map[f.featureClassName] === undefined)
          missing.add(f.featureClassName);
      }
    }

    if (missingCustom.size > 0) {
      const names = Array.from(missingCustom);
      const rows: FeatureSelectResult[] = await this.apiEntityManager
        .createQueryBuilder()
        .select('id, feature_class_name')
        .from('features', 'f')
        .where('feature_class_name IN (:...names)', { names })
        .andWhere('project_id = :projectId', { projectId })
        .execute();
      this.ensureFeaturesWereFound(
        names,
        rows.map((r) => r.feature_class_name),
      );
      rows.forEach((r) => {
        customFeaturesMap[r.feature_class_name] = r.id;
      });
    }

    if (missingPlatform.size > 0) {
      const names = Array.from(missingPlatform);
      const rows: FeatureSelectResult[] = await this.apiEntityManager
        .createQueryBuilder()
        .select('id, feature_class_name')
        .from('features', 'f')
        .where('feature_class_name IN (:...names)', { names })
        .andWhere('project_id IS NULL')
        .execute();
      this.ensureFeaturesWereFound(
        names,
        rows.map((r) => r.feature_class_name),
      );
      rows.forEach((r) => {
        platformFeaturesMap[r.feature_class_name] = r.id;
      });
    }
  }

  /**
   * Resolves the geo `feature_data` id for every `featureId/hash` combination
   * referenced by the batch, populating the (cross-batch) cache. Only
   * combinations not already cached are queried.
   */
  private async resolveFeatureDataIdsForBatch(
    batch: FeatureDataElement[],
    customFeaturesMap: FeatureIdByClassNameMap,
    platformFeaturesMap: FeatureIdByClassNameMap,
    featureDataIdByFeatureIdAndHash: FeatureDataIdByFeatureIdAndHashMap,
  ): Promise<void> {
    const missing = new Map<string, { featureId: string; hash: string }>();
    for (const element of batch) {
      const { isCustom, featureClassName } = element.featureDataFeature;
      const featureId = isCustom
        ? customFeaturesMap[featureClassName]
        : platformFeaturesMap[featureClassName];
      const key = `${featureId}/${element.featureDataHash}`;
      // Map.set is idempotent for an already-present key, so the cross-batch
      // cache check alone is enough to dedup within the batch too.
      if (featureDataIdByFeatureIdAndHash[key] === undefined)
        missing.set(key, { featureId, hash: element.featureDataHash });
    }

    if (missing.size === 0) return;

    const pairs = Array.from(missing.values());
    const featureIds = pairs.map((p) => p.featureId);
    const hashes = pairs.map((p) => p.hash);

    // Match on the raw (feature_id, hash) columns via an unnest-paired-array
    // join so the planner can use the unique_feature_data_per_project
    // (hash, feature_id) index. The previous `feature_id || '/' || hash IN (...)`
    // predicate was non-sargable: Postgres had to compute the concatenation for
    // every row of the ~30M-row features_data table, forcing an IO-bound seq
    // scan on every batch. Passing the keys as two arrays also avoids the
    // bind-parameter explosion of a large IN list. See MRXNM-95.
    const rows: FeatureDataSelectResult[] = await this.geoEntityManager.query(
      `SELECT fd.id AS "featureDataId", fd.feature_id AS "featureId", fd.hash AS "hash"
       FROM "${this.featuresDataTable}" fd
       JOIN unnest($1::uuid[], $2::text[]) AS k(feature_id, hash)
         ON fd.feature_id = k.feature_id AND fd.hash = k.hash`,
      [featureIds, hashes],
    );

    rows.forEach(({ featureDataId, featureId, hash }) => {
      featureDataIdByFeatureIdAndHash[`${featureId}/${hash}`] = featureDataId;
    });
  }

  private getScenarioFeaturesDataInsertValues(
    featureData: FeatureDataElement[],
    { customFeaturesMap, platformFeaturesMap }: FeatureIdByClassNameMaps,
    featureDataIdByFeatureIdAndHashMap: FeatureDataIdByFeatureIdAndHashMap,
    scenarioId: string,
  ) {
    const outputScenariosFeatureData: DeepPartial<OutputScenariosFeaturesDataGeoEntity>[] =
      [];
    const insertValues = featureData.map(
      ({
        apiFeature,
        featureDataFeature,
        featureDataHash,
        outputFeaturesData,
        ...rest
      }) => {
        const featureDataFeatureName = featureDataFeature.featureClassName;
        const featureDataFeatureId = featureDataFeature.isCustom
          ? customFeaturesMap[featureDataFeatureName]
          : platformFeaturesMap[featureDataFeatureName];

        const featureDataId =
          featureDataIdByFeatureIdAndHashMap[
            `${featureDataFeatureId}/${featureDataHash}`
          ];

        const apiFeatureName = apiFeature.featureClassName;
        const apiFeatureId = apiFeature.isCustom
          ? customFeaturesMap[apiFeatureName]
          : platformFeaturesMap[apiFeatureName];

        const scenarioFeatureDataId = v4();

        if (outputFeaturesData.length > 0)
          outputScenariosFeatureData.push(
            ...outputFeaturesData.map((record) => ({
              ...record,
              scenarioFeaturesId: scenarioFeatureDataId,
            })),
          );

        return {
          ...rest,
          featureDataId,
          apiFeatureId,
          scenarioId,
          id: scenarioFeatureDataId,
        };
      },
    );

    return {
      scenarioFeaturesData: insertValues,
      outputScenariosFeatureData,
    };
  }

  /**
   * Streams the `featuresData` array out of the (potentially hundreds of MB)
   * clone file and inserts it batch by batch — the whole file is never buffered
   * or `JSON.parse`d at once. `pipeline` propagates errors from any stage and
   * destroys every stream on error/early-exit (no leaked file read);
   * `stream-json`'s batch stage groups elements into arrays of `batchSize` and
   * iterating them applies backpressure (parsing pauses while a batch is
   * inserted), keeping the event loop responsive. See MRXNM-94.
   */
  private async importFeaturesData(
    em: EntityManager,
    readable: Readable,
    scenarioId: string,
    projectId: string,
  ): Promise<void> {
    const caches: FeatureLookupCaches = {
      customFeaturesMap: {},
      platformFeaturesMap: {},
      featureDataIdByFeatureIdAndHash: {},
    };

    await pipeline(
      readable,
      parser(),
      pick({ filter: 'featuresData' }),
      streamArray(),
      groupIntoBatches({ batchSize: this.batchSize }),
      async (batches: AsyncIterable<{ value: FeatureDataElement }[]>) => {
        for await (const items of batches) {
          await this.insertFeaturesDataBatch(
            em,
            items.map(({ value }) => value),
            caches,
            scenarioId,
            projectId,
          );
        }
      },
    );
  }

  /** Resolves a batch's lookups (using the shared caches) and inserts it. */
  private async insertFeaturesDataBatch(
    em: EntityManager,
    batch: FeatureDataElement[],
    caches: FeatureLookupCaches,
    scenarioId: string,
    projectId: string,
  ): Promise<void> {
    const {
      customFeaturesMap,
      platformFeaturesMap,
      featureDataIdByFeatureIdAndHash,
    } = caches;

    await this.resolveFeatureIdsForBatch(
      projectId,
      batch,
      customFeaturesMap,
      platformFeaturesMap,
    );
    await this.resolveFeatureDataIdsForBatch(
      batch,
      customFeaturesMap,
      platformFeaturesMap,
      featureDataIdByFeatureIdAndHash,
    );

    const { scenarioFeaturesData, outputScenariosFeatureData } =
      this.getScenarioFeaturesDataInsertValues(
        batch,
        { customFeaturesMap, platformFeaturesMap },
        featureDataIdByFeatureIdAndHash,
        scenarioId,
      );

    await em.getRepository(ScenarioFeaturesData).save(scenarioFeaturesData, {
      chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
    });
    if (outputScenariosFeatureData.length > 0) {
      await em
        .getRepository(OutputScenariosFeaturesDataGeoEntity)
        .save(outputScenariosFeatureData, {
          chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
        });
    }
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { pieceResourceId: scenarioId, projectId, uris, piece } = input;

    try {
      if (uris.length !== 1) {
        const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }
      const [scenarioFeaturesDataLocation] = uris;

      const readableOrError = await this.fileRepository.get(
        scenarioFeaturesDataLocation.uri,
      );

      if (isLeft(readableOrError)) {
        const errorMessage = `File with piece data for ${piece}/${scenarioId} is not available at ${scenarioFeaturesDataLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const readable = readableOrError.right;

      await this.geoEntityManager.transaction((em) =>
        this.importFeaturesData(em, readable, scenarioId, projectId),
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
