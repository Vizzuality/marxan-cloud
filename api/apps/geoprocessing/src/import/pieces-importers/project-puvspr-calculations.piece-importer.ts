import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ResourceKind } from '@marxan/cloning/domain';
import {
  FeatureAmountPerPlanningUnit,
  ProjectFeatureGeoOperation,
  ProjectPuvsprCalculationsContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/project-puvspr-calculations';
import { PuvsprCalculationsEntity } from '@marxan/puvspr-calculations';
import { SpecificationOperation } from '@marxan/specification';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager, Repository } from 'typeorm';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

type FeatureSelectResult = {
  id: string;
  feature_class_name: string;
};

@Injectable()
@PieceImportProvider()
export class ProjectPuvsprCalculationsPieceImporter
  implements ImportPieceProcessor
{
  private readonly logger: Logger = new Logger(
    ProjectPuvsprCalculationsPieceImporter.name,
  );

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
      piece === ClonePiece.ProjectPuvsprCalculations &&
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
      const [puvsprCalculationsLocation] = uris;

      const readableOrError = await this.fileRepository.get(
        puvsprCalculationsLocation.uri,
      );
      if (isLeft(readableOrError)) {
        const errorMessage = `File with piece data for ${piece}/${pieceResourceId} is not available at ${puvsprCalculationsLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await readableToBuffer(readableOrError.right);
      const stringPuvsprCalculationsOrError = buffer.toString();

      const {
        puvsprCalculations,
        projectFeaturesGeoOperations,
      }: ProjectPuvsprCalculationsContent = JSON.parse(
        stringPuvsprCalculationsOrError,
      );

      const parsedPuvsprCalculations = await this.parsePuvsprCalculations(
        puvsprCalculations,
        projectId,
      );

      const parsedProjectFeaturesGeoOperations =
        await this.parseProjectFeaturesGeoOperations(
          projectFeaturesGeoOperations,
          projectId,
        );

      await this.geoEntityManager.transaction(async (em) => {
        const puvsprRepo = em.getRepository(PuvsprCalculationsEntity);
        try {
          await puvsprRepo.save(parsedPuvsprCalculations, {
            chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
          });
        } catch (e) {
          this.logger.error(e);
          throw new Error('error while saving parsed puvspr calculations');
        }

        await this.apiEntityManager.transaction(async (em) => {
          await Promise.all(
            parsedProjectFeaturesGeoOperations.map(
              ({ featureId, geoOperation }) =>
                em
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

  private async parsePuvsprCalculations(
    puvsprCalculations: FeatureAmountPerPlanningUnit[],
    projectId: string,
  ) {
    const customFeaturesNames = puvsprCalculations
      .filter(({ isCustom }) => isCustom)
      .map(({ featureName }) => featureName);

    const customFeaturesMap = await this.getCustomFeaturesByFeatureName(
      customFeaturesNames,
      projectId,
    );

    const platformFeaturesNames = puvsprCalculations
      .filter(({ isCustom }) => !isCustom)
      .map(({ featureName }) => featureName);

    const platformFeaturesMap = await this.getPlatformFeaturesByFeatureName(
      platformFeaturesNames,
    );

    const projectPusByPuid = await this.getProjectPusByPuid(projectId);

    return puvsprCalculations.map(({ isCustom, featureName, amount, puid }) => {
      const featureId = isCustom
        ? customFeaturesMap[featureName]
        : platformFeaturesMap[featureName];

      return {
        amount,
        projectPuId: projectPusByPuid[puid],
        featureId,
        projectId: projectId,
      };
    });
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
