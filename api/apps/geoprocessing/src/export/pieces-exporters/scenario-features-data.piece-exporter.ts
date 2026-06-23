import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocation } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  FeatureDataElement,
  OutputFeatureDataElement,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-data';
import { ScenarioFeaturesData } from '@marxan/features';
import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type FeaturesSelectResult = {
  id: string;
  feature_class_name: string;
  is_custom: boolean;
};

type OutputScenarioFeaturesDataSelectResult = OutputFeatureDataElement & {
  scenarioFeaturesId: string;
};

/**
 * Raw row shape returned by the scenario_features_data QueryBuilder below.
 * Keys match the second argument passed to `.select`/`.addSelect`.
 */
type ScenarioFeaturesDataRawRow = {
  sfdId: string;
  apiFeatureId: string;
  featureId: number;
  currentArea: number;
  totalArea: number;
  fpf?: number;
  metadata?: Record<'sepdistance', number | string>;
  prop?: number;
  sepNum?: number;
  target2?: number;
  target?: number;
  targetocc?: number;
  featureDataFeatureId: string;
  featureDataHash: string;
};

@Injectable()
@PieceExportProvider()
export class ScenarioFeaturesDataPieceExporter implements ExportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ScenarioFeaturesDataPieceExporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioFeaturesData;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const scenarioId = input.resourceId;

    /**
     * Memory efficiency (MRXNM-21 -> MRXNM-96):
     *
     * Large scenarios produce ~1.14M scenario_features_data rows (14.5k PUs x
     * 79 features). MRXNM-21 already removed the entity hydration and the
     * O(N x M) nested filter (raw rows + a Map). But it still materialised
     * every raw row, the full transformed `featuresData` array AND the whole
     * `JSON.stringify` string at once -> ~4.2GB peak, near the 5Gi limit.
     *
     * This rewrite streams the big side: the scenario_features_data rows are
     * pulled from a server-side cursor and transformed + written to the output
     * file one at a time (see `streamFeaturesDataFileContent`), so the full
     * array / JSON string is never resident. The two remaining in-memory
     * lookups are provably small and do NOT scale with scenario size:
     *   - output rows: bounded by (scenario features x runs), NOT PU x feature
     *     (measured max ~1.5k rows/scenario on staging).
     *   - feature properties: one row per distinct feature (tens).
     * The output file shape (`ScenarioFeaturesDataContent`) is byte-identical
     * so the (streamed, MRXNM-94) importer keeps working as-is.
     */

    // Small lookup #1: output rows indexed by scenario_features_id.
    const outputScenariosFeaturesData: OutputScenarioFeaturesDataSelectResult[] =
      await this.geoprocessingEntityManager
        .createQueryBuilder()
        .select('osfd.run_id', 'runId')
        .addSelect('osfd.amount', 'amount')
        .addSelect('osfd.occurrences', 'occurrences')
        .addSelect('osfd.separation', 'separation')
        .addSelect('osfd.target', 'target')
        .addSelect('osfd.mpm', 'mpm')
        .addSelect('osfd.total_area', 'totalArea')
        .addSelect('osfd.scenario_features_id', 'scenarioFeaturesId')
        .from(ScenarioFeaturesData, 'sfd')
        .innerJoin(
          OutputScenariosFeaturesDataGeoEntity,
          'osfd',
          'sfd.id = osfd.scenario_features_id',
        )
        .where('sfd.scenario_id = :scenarioId', { scenarioId })
        .execute();

    const outputDataBySfdId = new Map<string, OutputFeatureDataElement[]>();
    for (const {
      scenarioFeaturesId,
      ...outputData
    } of outputScenariosFeaturesData) {
      const existing = outputDataBySfdId.get(scenarioFeaturesId);
      if (existing) {
        existing.push(outputData);
      } else {
        outputDataBySfdId.set(scenarioFeaturesId, [outputData]);
      }
    }

    // Small lookup #2: properties for every feature the scenario references.
    const featurePropertiesById =
      await this.getFeaturePropertiesById(scenarioId);

    // Big side: stream the sfd rows from a cursor; transform + write per row.
    const sfdRowStream =
      await this.buildScenarioFeaturesDataQuery(scenarioId).stream();

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ScenarioFeaturesData,
      {
        kind: input.resourceKind,
        scenarioId: input.resourceId,
      },
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(
        this.streamFeaturesDataFileContent(
          sfdRowStream,
          outputDataBySfdId,
          featurePropertiesById,
        ),
      ),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioFeaturesDataPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }

  /**
   * The scenario_features_data query whose rows become `featuresData` entries.
   * Streamed (`.stream()`) by the caller so the 1.14M-row set is never buffered.
   */
  private buildScenarioFeaturesDataQuery(scenarioId: string) {
    return (
      this.geoprocessingEntityManager
        .createQueryBuilder(ScenarioFeaturesData, 'sfd')
        .innerJoin('sfd.featureData', 'fd')
        .select('sfd.id', 'sfdId')
        .addSelect('sfd.apiFeatureId', 'apiFeatureId')
        .addSelect('sfd.featureId', 'featureId') // integer marxan feature id
        .addSelect('sfd.currentArea', 'currentArea')
        .addSelect('sfd.totalArea', 'totalArea')
        .addSelect('sfd.fpf', 'fpf')
        .addSelect('sfd.metadata', 'metadata')
        .addSelect('sfd.prop', 'prop')
        .addSelect('sfd.sepNum', 'sepNum')
        .addSelect('sfd.target2', 'target2')
        .addSelect('sfd.target', 'target')
        .addSelect('sfd.targetocc', 'targetocc')
        .addSelect('fd.featureId', 'featureDataFeatureId') // uuid (features.id)
        .addSelect('fd.hash', 'featureDataHash')
        .where('sfd.scenarioId = :scenarioId', { scenarioId })
        // Replicates the old `.filter((sfd) => sfd.featureData.featureId)`
        .andWhere('fd.featureId IS NOT NULL')
    );
  }

  /**
   * Resolves `feature_class_name`/`is_custom` for every feature referenced by
   * the scenario. The ids are gathered with DISTINCT queries (server-side) so
   * we never buffer the 1.14M-row set just to collect a handful of feature ids.
   */
  private async getFeaturePropertiesById(
    scenarioId: string,
  ): Promise<Record<string, Omit<FeaturesSelectResult, 'id'>>> {
    const idRows: { id: string }[] = await Promise.all([
      this.buildScenarioFeaturesDataQuery(scenarioId)
        .select('sfd.apiFeatureId', 'id')
        .distinct(true)
        .getRawMany<{ id: string }>(),
      this.buildScenarioFeaturesDataQuery(scenarioId)
        .select('fd.featureId', 'id')
        .distinct(true)
        .getRawMany<{ id: string }>(),
    ]).then(([apiFeatureIds, featureDataFeatureIds]) => [
      ...apiFeatureIds,
      ...featureDataFeatureIds,
    ]);

    const featuresIds = [...new Set(idRows.map((row) => row.id))];

    let features: FeaturesSelectResult[] = [];
    if (featuresIds.length > 0) {
      features = await this.apiEntityManager
        .createQueryBuilder()
        .select('id, feature_class_name, is_custom')
        .from('features', 'f')
        .where('id IN (:...featuresIds)', { featuresIds })
        .execute();
    }

    const featurePropertiesById: Record<
      string,
      Omit<FeaturesSelectResult, 'id'>
    > = {};
    features.forEach(({ id, feature_class_name, is_custom }) => {
      featurePropertiesById[id] = { feature_class_name, is_custom };
    });

    // Fail fast: validate up front, before any streaming starts. The transform
    // now runs lazily inside the file-write stream, where a thrown error would
    // be swallowed by storeFile's try/catch (-> "couldn't save file") instead
    // of surfacing as the original "Feature properties not found" error.
    const missingId = featuresIds.find(
      (id) => featurePropertiesById[id] === undefined,
    );
    if (missingId !== undefined)
      throw new Error(
        `Feature properties not found for feature with id ${missingId}`,
      );

    return featurePropertiesById;
  }

  /**
   * Streams the `{ "featuresData": [...] }` file content. Each raw sfd row is
   * transformed and serialised on its own, joined with commas, so the whole
   * array / JSON string is never held in memory. Backpressure from the file
   * write pauses the DB cursor; an empty stream yields `{"featuresData":[]}`.
   */
  private async *streamFeaturesDataFileContent(
    rowStream: Readable,
    outputDataBySfdId: Map<string, OutputFeatureDataElement[]>,
    featurePropertiesById: Record<string, Omit<FeaturesSelectResult, 'id'>>,
  ): AsyncGenerator<string> {
    yield '{"featuresData":[';
    let first = true;
    for await (const row of rowStream as AsyncIterable<ScenarioFeaturesDataRawRow>) {
      const element = this.toFeatureDataElement(
        row,
        outputDataBySfdId,
        featurePropertiesById,
      );
      yield (first ? '' : ',') + JSON.stringify(element);
      first = false;
    }
    yield ']}';
  }

  private toFeatureDataElement(
    row: ScenarioFeaturesDataRawRow,
    outputDataBySfdId: Map<string, OutputFeatureDataElement[]>,
    featurePropertiesById: Record<string, Omit<FeaturesSelectResult, 'id'>>,
  ): FeatureDataElement {
    const apiFeatureProperties = featurePropertiesById[row.apiFeatureId];
    const featureDataFeatureProperties =
      featurePropertiesById[row.featureDataFeatureId];

    if (!apiFeatureProperties)
      throw new Error(
        `Feature properties not found for feature with id ${row.apiFeatureId}`,
      );

    if (!featureDataFeatureProperties)
      throw new Error(
        `Feature properties not found for feature with id ${row.featureDataFeatureId}`,
      );

    return {
      currentArea: row.currentArea,
      featureDataHash: row.featureDataHash,
      featureId: row.featureId,
      specificationId: undefined,
      totalArea: row.totalArea,
      fpf: row.fpf,
      metadata: row.metadata,
      prop: row.prop,
      sepNum: row.sepNum,
      target2: row.target2,
      target: row.target,
      targetocc: row.targetocc,
      apiFeature: {
        isCustom: apiFeatureProperties.is_custom,
        featureClassName: apiFeatureProperties.feature_class_name ?? '',
      },
      featureDataFeature: {
        isCustom: featureDataFeatureProperties.is_custom,
        featureClassName: featureDataFeatureProperties.feature_class_name ?? '',
      },
      outputFeaturesData: outputDataBySfdId.get(row.sfdId) ?? [],
    };
  }
}
