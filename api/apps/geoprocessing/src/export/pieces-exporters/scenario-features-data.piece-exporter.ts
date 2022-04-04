import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  FeatureDataElement,
  ScenarioFeaturesDataContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-data';
import { ScenarioFeaturesData } from '@marxan/features';
import { FileRepository } from '@marxan/files-repository';
import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager, In } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type FeaturesSelectResult = {
  id: string;
  feature_class_name: string;
  is_custom: boolean;
};

type FeatureDataElementWithFeatureId = FeatureDataElement & {
  sfdId: string;
  apiFeatureId: string;
};

type FeatureDataElementWithIsCustom = FeatureDataElementWithFeatureId & {
  isCustom: boolean;
  featureClassName: string;
};

@Injectable()
@PieceExportProvider()
export class ScenarioFeaturesDataPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioFeaturesDataPieceExporter.name);
  }

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
        apiFeatureId: sfd.featureData.featureId!,
        currentArea: sfd.currentArea,
        featureDataHash: sfd.featureData.hash,
        featureId: sfd.featureId,
        specificationId: sfd.specificationId,
        totalArea: sfd.totalArea,
        fpf: sfd.fpf,
        metadata: sfd.metadata,
        prop: sfd.prop,
        sepNum: sfd.sepNum,
        target2: sfd.target2,
        target: sfd.target,
        targetocc: sfd.targetocc,
        featureClassName: '',
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
      const featureProperties = featurePropertiesById[el.apiFeatureId];

      if (!featureProperties)
        throw new Error(
          `Feature properties not found for feature with id ${el.apiFeatureId}`,
        );

      return {
        ...el,
        isCustom: featureProperties.is_custom,
        featureClassName: featureProperties.feature_class_name,
      };
    });
  }

  private getFileContent(
    scenarioFeaturesDataWithIsCustom: FeatureDataElementWithIsCustom[],
    outputScenariosFeaturesData: OutputScenariosFeaturesDataGeoEntity[],
  ): ScenarioFeaturesDataContent {
    const customFeaturesData: FeatureDataElement[] = [];
    const platformFeaturesData: FeatureDataElement[] = [];

    scenarioFeaturesDataWithIsCustom.forEach(
      ({ sfdId, isCustom, apiFeatureId, ...sfd }) => {
        const outputData = outputScenariosFeaturesData.filter(
          (el) => el.featureScenarioId === sfdId,
        );

        const array = isCustom ? customFeaturesData : platformFeaturesData;
        array.push({
          ...sfd,
          outputFeaturesData: outputData.map(
            ({ id, featureScenarioId, ...rest }) => ({
              ...rest,
            }),
          ),
        });
      },
    );

    return {
      customFeaturesData,
      platformFeaturesData,
    };
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const scenarioFeaturesData = await this.geoprocessingEntityManager
      .getRepository(ScenarioFeaturesData)
      .find({
        where: { scenarioId: input.resourceId },
        relations: ['featureData'],
      });
    const outputScenariosFeaturesData = await this.geoprocessingEntityManager
      .getRepository(OutputScenariosFeaturesDataGeoEntity)
      .find({
        where: {
          featureScenarioId: In(scenarioFeaturesData.map((el) => el.id)),
        },
      });

    const scenarioFeaturesDataWithFeatureId = this.parseScenarioFeaturesDataToFeatureDataElementWithFeatureId(
      scenarioFeaturesData,
    );
    const featuresIds = [
      ...new Set<string>(
        scenarioFeaturesDataWithFeatureId.map((sfd) => sfd.apiFeatureId),
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

    const scenarioFeaturesDataWithIsCustom = this.getScenarioFeaturesDataWithIsCustom(
      scenarioFeaturesDataWithFeatureId,
      features,
    );

    const fileContent = this.getFileContent(
      scenarioFeaturesDataWithIsCustom,
      outputScenariosFeaturesData,
    );

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioFeaturesDataPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioFeaturesData,
        outputFile.right,
        {
          kind: input.resourceKind,
          scenarioId: input.resourceId,
        },
      ),
    };
  }
}
