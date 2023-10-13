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

type FeatureDataElementWithFeatureId = Omit<
  FeatureDataElement,
  'apiFeature' | 'featureDataFeature'
> & {
  sfdId: string;
  apiFeatureId: string;
  featureDataFeatureId: string;
};

type FeatureDataElementWithIsCustom = FeatureDataElementWithFeatureId & {
  apiFeature: { isCustom: boolean; featureClassName: string };
  featureDataFeature: { isCustom: boolean; featureClassName: string };
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

  private parseScenarioFeaturesDataToFeatureDataElementWithFeatureId(
    scenarioFeaturesData: ScenarioFeaturesData[],
  ): FeatureDataElementWithFeatureId[] {
    return scenarioFeaturesData
      .filter((sfd) => sfd.featureData.featureId)
      .map((sfd) => ({
        sfdId: sfd.id,
        apiFeatureId: sfd.apiFeatureId,
        featureDataFeatureId: sfd.featureData.featureId!,
        currentArea: sfd.currentArea,
        featureDataHash: sfd.featureData.hash,
        featureId: sfd.featureId,
        specificationId: undefined,
        totalArea: sfd.totalArea,
        fpf: sfd.fpf,
        metadata: sfd.metadata,
        prop: sfd.prop,
        sepNum: sfd.sepNum,
        target2: sfd.target2,
        target: sfd.target,
        targetocc: sfd.targetocc,
        outputFeaturesData: [],
      }));
  }

  private getScenarioFeaturesDataWithIsCustom(
    featuresDataWithFeatureId: FeatureDataElementWithFeatureId[],
    features: FeaturesSelectResult[],
  ): FeatureDataElementWithIsCustom[] {
    const featurePropertiesById: Record<
      string,
      Omit<FeaturesSelectResult, 'id'>
    > = {};
    features.forEach(({ id, feature_class_name, is_custom }) => {
      featurePropertiesById[id] = { feature_class_name, is_custom };
    });

    return featuresDataWithFeatureId.map((el) => {
      const apiFeatureProperties = featurePropertiesById[el.apiFeatureId];
      const featureDataFeatureProperties =
        featurePropertiesById[el.featureDataFeatureId];

      if (!apiFeatureProperties)
        throw new Error(
          `Feature properties not found for feature with id ${el.apiFeatureId}`,
        );

      if (!featureDataFeatureProperties)
        throw new Error(
          `Feature properties not found for feature with id ${el.featureDataFeatureId}`,
        );
      return {
        ...el,
        apiFeature: {
          isCustom: apiFeatureProperties.is_custom,
          featureClassName: apiFeatureProperties.feature_class_name ?? '',
        },
        featureDataFeature: {
          isCustom: featureDataFeatureProperties.is_custom,
          featureClassName:
            featureDataFeatureProperties.feature_class_name ?? '',
        },
      };
    });
  }

  private getFileContent(
    scenarioFeaturesDataWithIsCustom: FeatureDataElementWithIsCustom[],
    outputScenariosFeaturesData: OutputScenarioFeaturesDataSelectResult[],
  ): ScenarioFeaturesDataContent {
    const featuresData: FeatureDataElement[] = [];

    scenarioFeaturesDataWithIsCustom.forEach(
      ({ sfdId, apiFeatureId, featureDataFeatureId, ...sfd }) => {
        const outputData = outputScenariosFeaturesData.filter(
          (el) => el.scenarioFeaturesId === sfdId,
        );
        featuresData.push({
          ...sfd,
          outputFeaturesData: outputData.map(
            ({ scenarioFeaturesId, ...rest }) => ({
              ...rest,
            }),
          ),
        });
      },
    );

    return {
      featuresData,
    };
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const scenarioFeaturesData = await this.geoprocessingEntityManager
      .getRepository(ScenarioFeaturesData)
      .find({
        where: { scenarioId: input.resourceId },
        relations: ['featureData'],
      });

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

    const scenarioFeaturesDataWithFeatureId =
      this.parseScenarioFeaturesDataToFeatureDataElementWithFeatureId(
        scenarioFeaturesData,
      );
    const featuresIds = [
      ...new Set<string>(
        scenarioFeaturesDataWithFeatureId.flatMap((sfd) => [
          sfd.apiFeatureId,
          sfd.featureDataFeatureId,
        ]),
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

    const scenarioFeaturesDataWithIsCustom =
      this.getScenarioFeaturesDataWithIsCustom(
        scenarioFeaturesDataWithFeatureId,
        features,
      );

    const fileContent = this.getFileContent(
      scenarioFeaturesDataWithIsCustom,
      outputScenariosFeaturesData,
    );

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
