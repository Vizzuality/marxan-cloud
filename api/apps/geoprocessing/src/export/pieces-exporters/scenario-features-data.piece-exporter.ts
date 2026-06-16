import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocation } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  FeatureDataElement,
  OutputFeatureDataElement,
  ScenarioFeaturesDataContent,
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
    /**
     * Memory/CPU efficiency (MRXNM-21):
     *
     * Large scenarios produce ~1.14M scenario_features_data rows
     * (14.5k planning units x 79 features). The previous implementation:
     *   1. Hydrated every row as a TypeORM entity with its `featureData`
     *      relation (a heavy object graph kept fully in memory).
     *   2. Ran a nested `.filter(...)` over the output rows for EACH sfd row,
     *      i.e. O(N x M) ~= 1.14M x 7.9k comparisons (a CPU + GC bomb).
     *   3. Built several full-size intermediate arrays simultaneously.
     * All three caused the exporter to OOM.
     *
     * This rewrite instead:
     *   - Reads plain rows via `.getRawMany()` (no entity hydration).
     *   - Indexes the output rows once into a Map for O(1) lookups.
     *   - Produces the final `featuresData` array in a single pass.
     * The output file shape (`ScenarioFeaturesDataContent`) is unchanged so
     * the importer keeps working as-is.
     */
    const rows: ScenarioFeaturesDataRawRow[] =
      await this.geoprocessingEntityManager
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
        .where('sfd.scenarioId = :scenarioId', { scenarioId: input.resourceId })
        // Replicates the old `.filter((sfd) => sfd.featureData.featureId)`
        .andWhere('fd.featureId IS NOT NULL')
        .getRawMany();

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
        .where('sfd.scenario_id = :scenarioId', {
          scenarioId: input.resourceId,
        })
        .execute();

    // Index output rows by scenarioFeaturesId once -> O(1) lookups per sfd row.
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

    const featuresIds = [
      ...new Set<string>(
        rows.flatMap((row) => [row.apiFeatureId, row.featureDataFeatureId]),
      ),
    ];

    let features: FeaturesSelectResult[] = [];

    if (featuresIds.length > 0) {
      features = await this.apiEntityManager
        .createQueryBuilder()
        .select('id, feature_class_name, is_custom')
        .from('features', 'f')
        .where('id IN (:...featuresIds)', {
          featuresIds,
        })
        .execute();
    }

    const featurePropertiesById: Record<
      string,
      Omit<FeaturesSelectResult, 'id'>
    > = {};
    features.forEach(({ id, feature_class_name, is_custom }) => {
      featurePropertiesById[id] = { feature_class_name, is_custom };
    });

    const featuresData: FeatureDataElement[] = rows.map((row) => {
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
          featureClassName:
            featureDataFeatureProperties.feature_class_name ?? '',
        },
        outputFeaturesData: outputDataBySfdId.get(row.sfdId) ?? [],
      };
    });

    const fileContent: ScenarioFeaturesDataContent = {
      featuresData,
    };

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ScenarioFeaturesData,
      {
        kind: input.resourceKind,
        scenarioId: input.resourceId,
      },
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(fileContent)),
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
}
