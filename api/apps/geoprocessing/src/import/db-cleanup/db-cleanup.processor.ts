import { BlmFinalResultsRepository } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-final-results.repository';
import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ResourceKind } from '@marxan/cloning/domain';
import { FailedImportDbCleanupJobInput } from '@marxan/cloning/job-input';
import { FailedImportDbCleanupJobOutput } from '@marxan/cloning/job-output';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import {
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ProtectedArea } from '@marxan/protected-areas';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { chunk } from 'lodash';
import { EntityManager, In, Repository } from 'typeorm';
import { geoprocessingConnections } from '../../ormconfig';

@Injectable()
export class DbCleanupProcessor {
  #dbCleaners: Record<ResourceKind, (resourceId: string) => Promise<void>> = {
    [ResourceKind.Project]: (projectId) => this.cleanProjectImport(projectId),
    [ResourceKind.Scenario]: (scenarioId) =>
      this.cleanScenarioImport(scenarioId),
  };

  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoEntityManager: EntityManager,
    @InjectRepository(ProjectsPuEntity)
    private readonly projectsPuRepo: Repository<ProjectsPuEntity>,
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly scenariosPuDataRepo: Repository<ScenariosPuPaDataGeo>,
  ) {}

  private async cleanScenarioImport(scenarioId: string) {
    const apiQb = this.apiEntityManager.createQueryBuilder();

    await apiQb
      .delete()
      .from('scenarios')
      .where('id = :scenarioId', { scenarioId })
      .execute();

    await this.geoEntityManager.transaction(async (geoTransactionManager) => {
      await geoTransactionManager.delete(BlmFinalResultEntity, { scenarioId });

      const scenarioPuData = await this.scenariosPuDataRepo.find({
        where: { scenarioId },
      });

      await geoTransactionManager.delete(OutputScenariosPuDataGeoEntity, {
        scenarioPuId: In(scenarioPuData.map((pu) => pu.id)),
      });

      await geoTransactionManager.delete(ScenarioFeaturesData, { scenarioId });

      await geoTransactionManager.delete(ScenariosPuPaDataGeo, { scenarioId });

      await geoTransactionManager.delete(MarxanExecutionMetadataGeoEntity, {
        scenarioId,
      });
    });
  }

  private async cleanProjectImport(projectId: string) {
    const scenarios: { id: string }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('scenarios', 's')
      .where('project_id = :projectId', {
        projectId,
      })
      .execute();
    const scenarioIds = scenarios.map((scenario) => scenario.id);
    const projectHasScenarios = scenarioIds.length > 0;

    const projectCustomFeatures: {
      id: string;
    }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('features', 'f')
      .where('project_id = :projectId', { projectId })
      .execute();

    await this.apiEntityManager
      .createQueryBuilder()
      .delete()
      .from('projects')
      .where('id = :projectId', { projectId })
      .execute();

    await this.geoEntityManager.transaction(async (geoTransactionManager) => {
      await geoTransactionManager.delete(PlanningArea, { projectId });

      await geoTransactionManager.delete(ProtectedArea, { projectId });

      await Promise.all(
        chunk(
          projectCustomFeatures.map((feature) => feature.id),
          CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
        ).map((chunkFeatureIds) =>
          geoTransactionManager.delete(GeoFeatureGeometry, {
            featureId: In(chunkFeatureIds),
          }),
        ),
      );

      if (projectHasScenarios) {
        await geoTransactionManager.delete(BlmFinalResultEntity, {
          scenarioId: In(scenarioIds),
        });

        const scenariosPuData = await this.scenariosPuDataRepo.find({
          where: { scenarioId: In(scenarioIds) },
        });

        await Promise.all(
          chunk(
            scenariosPuData.map((pu) => pu.id),
            CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
          ).map((scenarioPuDataIds) =>
            geoTransactionManager.delete(OutputScenariosPuDataGeoEntity, {
              featureId: In(scenarioPuDataIds),
            }),
          ),
        );

        await geoTransactionManager.delete(ScenarioFeaturesData, {
          scenarioId: In(scenarioIds),
        });

        await geoTransactionManager.delete(MarxanExecutionMetadataGeoEntity, {
          scenarioId: In(scenarioIds),
        });
      }

      await this.projectsPuRepo.delete({ projectId });
    });
  }

  async run(
    input: FailedImportDbCleanupJobInput,
  ): Promise<FailedImportDbCleanupJobOutput> {
    await this.#dbCleaners[input.resourceKind](input.resourceId);
    return input;
  }
}
