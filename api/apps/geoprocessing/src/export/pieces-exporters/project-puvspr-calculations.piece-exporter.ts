import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocation, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectPuvsprCalculationsContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-puvspr-calculations';
import { SingleConfigFeatureValueStripped } from '@marxan/features-hash';
import {
  FeatureAmountPerPlanningUnit,
  PuvsprCalculationsRepository,
} from '@marxan/puvspr-calculations';
import { SpecificationOperation } from '@marxan/specification';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type FeaturesSelectResult = {
  featureName: string;
  isCustom: boolean;
  id: string;
};

type ProjectFeaturesSelectResult = {
  featureName: string;
  geoOperation: SingleConfigFeatureValueStripped;
};

type FeatureByIdMap = Record<string, Omit<FeaturesSelectResult, 'id'>>;

@Injectable()
@PieceExportProvider()
export class ProjectPuvsprCalculationsPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    private readonly puvsprCalculationsRepo: PuvsprCalculationsRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ProjectPuvsprCalculationsPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectPuvsprCalculations &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const projectId = input.resourceId;

    const featureAmountPerPlanningUnit = await this.puvsprCalculationsRepo.getAmountPerPlanningUnitAndFeatureInProject(
      projectId,
    );

    const featureIds = featureAmountPerPlanningUnit.map(
      ({ featureId }) => featureId,
    );

    const featuresById = await this.getFeaturesById(featureIds);

    const featuresAmountPerPlanningUnitParsed = this.parseFeatureAmountPerPlanningUnit(
      featureAmountPerPlanningUnit,
      featuresById,
    );

    const projectFeaturesGeoOperations = await this.getProjectFeaturesGeoOperations(
      projectId,
    );

    const fileContent: ProjectPuvsprCalculationsContent = {
      puvsprCalculations: featuresAmountPerPlanningUnitParsed,
      projectFeaturesGeoOperations,
    };

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ProjectPuvsprCalculations,
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(fileContent)),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ProjectPuvsprCalculationsPieceExporter.name} - Project - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }

  private async getFeaturesById(featureIds: string[]) {
    const result: FeatureByIdMap = {};

    if (!featureIds.length) return result;

    const features: FeaturesSelectResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('feature_class_name', 'featureName')
      .addSelect('id')
      .addSelect('is_custom', 'isCustom')
      .from('features', 'f')
      .where('id IN (:...featureIds)', { featureIds })
      .execute();

    return features.reduce((prev, { id, ...rest }) => {
      prev[id] = rest;
      return prev;
    }, result);
  }

  private parseFeatureAmountPerPlanningUnit(
    featureAmountPerPlanningUnit: FeatureAmountPerPlanningUnit[],
    featuresByIdMap: FeatureByIdMap,
  ) {
    return featureAmountPerPlanningUnit.map(({ featureId, ...rest }) => {
      const feature = featuresByIdMap[featureId];
      return {
        ...rest,
        featureName: feature.featureName,
        isCustom: feature.isCustom,
      };
    });
  }

  private async getProjectFeaturesGeoOperations(projectId: string) {
    const derivedFeatures: ProjectFeaturesSelectResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('feature_class_name', 'featureName')
      .addSelect('from_geoprocessing_ops', 'geoOperation')
      .from('features', 'f')
      .where('project_id = :projectId', { projectId })
      .andWhere('from_geoprocessing_ops IS NOT NULL')
      .execute();

    const dataFeatureIds = derivedFeatures.map(({ geoOperation }) => {
      if (geoOperation.operation !== SpecificationOperation.Split) {
        const errorMessage = 'Can only proccess split features';
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      return geoOperation.baseFeatureId;
    });

    const dataFeaturesById = await this.getFeaturesById(dataFeatureIds);

    return derivedFeatures.map(({ featureName, geoOperation }) => ({
      featureName,
      geoOperation: {
        operation: geoOperation.operation,
        splitByProperty: geoOperation.splitByProperty,
        value: geoOperation.value,
        baseFeatureName:
          dataFeaturesById[geoOperation.baseFeatureId].featureName,
        baseFeatureIsCustom:
          dataFeaturesById[geoOperation.baseFeatureId].isCustom,
      },
    }));
  }
}
