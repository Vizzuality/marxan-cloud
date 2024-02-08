import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CleanupTasks } from './cleanup-tasks';
import { chunk } from 'lodash';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ScenarioFeaturesData } from '@marxan/features';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { BlmPartialResultEntity } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-partial-results.geo.entity';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';

const CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS = 1000;
const cronJobInterval: string = AppConfig.get(
  'cleanupCronJobSettings.interval',
);

type ProjectIdsInUse = { project_id: string }[];
type ScenarioIdsInUse = { scenario_id: string }[];
type FeatureIdsInUse = { feature_id: string }[];
type CostSurfacesIdsInUse = { cost_surface_id: string }[];

@Injectable()
export class CleanupTasksService implements CleanupTasks {
  private readonly logger = new Logger(CleanupTasksService.name);
  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoEntityManager: EntityManager,
  ) {}

  @Cron(cronJobInterval)
  async handleCron() {
    this.logger.debug(
      'Preparing to clean dangling geo data for projects/scenarios',
    );

    const { apiProjectIds, geoProjectIds } = await this.getProjectIdsInUse();

    const { apiScenarioIds, geoScenarioIds } = await this.getScenarioIdsInUse();

    const { apiFeaturesIds, geoFeatureIds } = await this.getFeaturesIdsInUse();

    const { apiCostSurfacesIds, geoCostSurfacesIds } =
      await this.getCostSurfacesIdsInUse();

    await this.storeDanglingProjectIds(apiProjectIds, geoProjectIds);

    await this.deleteDanglinProjectIdsInGeoDb();

    await this.storeDanglingScenarioIds(apiScenarioIds, geoScenarioIds);

    await this.deleteDanglinScenarioIdsInGeoDb();

    await this.storeDanglingFeatureIds(apiFeaturesIds, geoFeatureIds);

    await this.deleteDanglingFeatureIdsInGeoDb();

    await this.storeDanglingCostSurfacesIds(
      apiCostSurfacesIds,
      geoCostSurfacesIds,
    );

    await this.deleteDanglingCostSurfacesIdsInGeoDb();
  }

  async getProjectIdsInUse() {
    return this.apiEntityManager.transaction(async (apiTransactionManager) => {
      const apiProjectIds: string[] = await apiTransactionManager
        .createQueryBuilder()
        .from('projects', 'p')
        .select(['id'])
        .setLock('pessimistic_write_or_fail')
        .getRawMany()
        .then((result) => result.map((i) => i.id))
        .catch((error) => {
          throw new Error(error);
        });

      const geoProjectIds = await this.getGeoProjectIdsInUse();

      return { apiProjectIds, geoProjectIds };
    });
  }

  async getScenarioIdsInUse() {
    return this.apiEntityManager.transaction(async (apiTransactionManager) => {
      const apiScenarioIds: string[] = await apiTransactionManager
        .createQueryBuilder()
        .from('scenarios', 's')
        .select(['id'])
        .setLock('pessimistic_write_or_fail')
        .getRawMany()
        .then((result) => result.map((i) => i.id))
        .catch((error) => {
          throw new Error(error);
        });

      const geoScenarioIds = await this.getGeoScenarioIdsInUse();

      return { apiScenarioIds, geoScenarioIds };
    });
  }

  async getFeaturesIdsInUse() {
    return this.apiEntityManager.transaction(async (apiTransactionManager) => {
      const apiFeaturesIds: string[] = await apiTransactionManager
        .createQueryBuilder()
        .from('features', 's')
        .select(['id'])
        .setLock('pessimistic_write_or_fail')
        .getRawMany()
        .then((result) => result.map((i) => i.id))
        .catch((error) => {
          throw new Error(error);
        });

      const geoFeatureIds = await this.getGeoFeatureIdsInUse();

      return { apiFeaturesIds, geoFeatureIds };
    });
  }

  async getCostSurfacesIdsInUse() {
    return this.apiEntityManager.transaction(async (apiTransactionManager) => {
      const apiCostSurfacesIds: string[] = await apiTransactionManager
        .createQueryBuilder()
        .from('cost_surfaces', 'cs')
        .select(['id'])
        .setLock('pessimistic_write_or_fail')
        .getRawMany()
        .then((result) => result.map((i) => i.id))
        .catch((error) => {
          throw new Error(error);
        });

      const geoCostSurfacesIds = await this.getGeoCostSurfacesIdsInUse();

      return { apiCostSurfacesIds, geoCostSurfacesIds };
    });
  }

  async getGeoProjectIdsInUse() {
    // For every related entity, we look for projectids inside entity table
    const planningAreasProjectIds = await this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['project_id'])
      .select('project_id')
      .from(PlanningArea, 'pa')
      .where('project_id IS NOT NULL')
      .execute()
      .then((result: ProjectIdsInUse) => result.map((i) => i.project_id))
      .catch((error) => {
        throw new Error(error);
      });

    const protectedAreasProjectIds = await this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['project_id'])
      .select('project_id')
      .from(ProtectedArea, 'wdpa')
      .where('project_id IS NOT NULL')
      .execute()
      .then((result: ProjectIdsInUse) => result.map((i) => i.project_id))
      .catch((error) => {
        throw new Error(error);
      });

    const projectPusProjectIds = await this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['project_id'])
      .select('project_id')
      .from(ProjectsPuEntity, 'ppu')
      .where('project_id IS NOT NULL')
      .execute()
      .then((result: ProjectIdsInUse) => result.map((i) => i.project_id))
      .catch((error) => {
        throw new Error(error);
      });

    return planningAreasProjectIds.concat(
      protectedAreasProjectIds,
      projectPusProjectIds,
    );
  }

  async getGeoScenarioIdsInUse() {
    const scenarioFeatureDataScenarioIds = await this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['scenario_id'])
      .select('scenario_id')
      .from(ScenarioFeaturesData, 'sfd')
      .where('scenario_id IS NOT NULL')
      .execute()
      .then((result: ScenarioIdsInUse) => result.map((i) => i.scenario_id))
      .catch((error) => {
        throw new Error(error);
      });

    const blmFinalResultsScenarioIds = await this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['scenario_id'])
      .select('scenario_id')
      .from(BlmFinalResultEntity, 'bfr')
      .execute()
      .then((result: ScenarioIdsInUse) => result.map((i) => i.scenario_id))
      .catch((error) => {
        throw new Error(error);
      });

    const blmPartialResultsScenarioIds = await this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['scenario_id'])
      .select('scenario_id')
      .from(BlmPartialResultEntity, 'bpr')
      .execute()
      .then((result: ScenarioIdsInUse) => result.map((i) => i.scenario_id))
      .catch((error) => {
        throw new Error(error);
      });

    const marxanExecutionMetadaScenarioIds = await this.geoEntityManager
      .query(
        `SELECT DISTINCT ("scenarioId") scenario_id
        FROM marxan_execution_metadata mem`,
      )
      .then((result: ScenarioIdsInUse) => result.map((i) => i.scenario_id))
      .catch((error) => {
        throw new Error(error);
      });

    const scenarioPlanningUnitsScenarioIds = await this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['scenario_id'])
      .select('scenario_id')
      .from(ScenariosPlanningUnitGeoEntity, 'spu')
      .execute()
      .then((result: ScenarioIdsInUse) => result.map((i) => i.scenario_id))
      .catch((error) => {
        throw new Error(error);
      });

    return scenarioFeatureDataScenarioIds.concat(
      blmFinalResultsScenarioIds,
      blmPartialResultsScenarioIds,
      marxanExecutionMetadaScenarioIds,
      scenarioPlanningUnitsScenarioIds,
    );
  }

  async getGeoFeatureIdsInUse() {
    return this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['feature_id'])
      .select('feature_id')
      .from(GeoFeatureGeometry, 'fd')
      .where('feature_id IS NOT NULL')
      .execute()
      .then((result: FeatureIdsInUse) => result.map((i) => i.feature_id))
      .catch((error) => {
        throw new Error(error);
      });
  }

  async getGeoCostSurfacesIdsInUse() {
    return this.geoEntityManager
      .createQueryBuilder()
      .distinctOn(['cost_surface_id'])
      .select('cost_surface_id')
      .from(CostSurfacePuDataEntity, 'cspd')
      .execute()
      .then((result: CostSurfacesIdsInUse) =>
        result.map((i) => i.cost_surface_id),
      )
      .catch((error) => {
        throw new Error(error);
      });
  }

  async storeDanglingProjectIds(
    apiProjectIds: string[],
    geoProjectIds: string[],
  ) {
    const danglingProjectIds = this.getGeoIdsInUseNotInApiIdsInUse(
      apiProjectIds,
      geoProjectIds,
    );

    await this.geoEntityManager
      .createQueryBuilder()
      .delete()
      .from('dangling_projects')
      .execute();

    for (const projectIdsChuncks of chunk(
      danglingProjectIds,
      CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
    )) {
      await this.geoEntityManager
        .createQueryBuilder()
        .insert()
        .into('dangling_projects')
        .values(
          projectIdsChuncks.map((projectId) => ({ project_id: projectId })),
        )
        .execute();
    }
  }

  async storeDanglingScenarioIds(
    apiScenarioIds: string[],
    geoScenarioIds: string[],
  ) {
    const danglingScenarioIds = this.getGeoIdsInUseNotInApiIdsInUse(
      apiScenarioIds,
      geoScenarioIds,
    );

    await this.geoEntityManager
      .createQueryBuilder()
      .delete()
      .from('dangling_scenarios')
      .execute();

    for (const scenarioIdsChuncks of chunk(
      danglingScenarioIds,
      CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
    )) {
      await this.geoEntityManager
        .createQueryBuilder()
        .insert()
        .into('dangling_scenarios')
        .values(
          scenarioIdsChuncks.map((scenarioId) => ({ scenario_id: scenarioId })),
        )
        .execute();
    }
  }

  async storeDanglingFeatureIds(
    apiFeatureIds: string[],
    geoFeatureIds: string[],
  ) {
    const danglingFeatureIds = this.getGeoIdsInUseNotInApiIdsInUse(
      apiFeatureIds,
      geoFeatureIds,
    );

    await this.geoEntityManager
      .createQueryBuilder()
      .delete()
      .from('dangling_features')
      .execute();

    for (const featureIdsChuncks of chunk(
      danglingFeatureIds,
      CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
    )) {
      await this.geoEntityManager
        .createQueryBuilder()
        .insert()
        .into('dangling_features')
        .values(
          featureIdsChuncks.map((featureId) => ({ feature_id: featureId })),
        )
        .execute();
    }
  }

  async storeDanglingCostSurfacesIds(
    apiCostSurfacesIds: string[],
    geoCostSurfacesIds: string[],
  ) {
    const danglingCostSurfacesIds = this.getGeoIdsInUseNotInApiIdsInUse(
      apiCostSurfacesIds,
      geoCostSurfacesIds,
    );

    await this.geoEntityManager
      .createQueryBuilder()
      .delete()
      .from('dangling_cost_surfaces')
      .execute();

    for (const costSurfacesIdsChunks of chunk(
      danglingCostSurfacesIds,
      CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
    )) {
      await this.geoEntityManager
        .createQueryBuilder()
        .insert()
        .into('dangling_cost_surfaces')
        .values(
          costSurfacesIdsChunks.map((costSurfaceId) => ({
            cost_surface_id: costSurfaceId,
          })),
        )
        .execute();
    }
  }

  async deleteDanglinProjectIdsInGeoDb() {
    // For every related entity, we look for matching ids inside entity table
    // and compare it with intermediate dangling_projects table to delete records
    await this.geoEntityManager.query(
      `DELETE FROM planning_areas pa
        WHERE pa.project_id IN (
          SELECT dp.project_id FROM dangling_projects dp
        );`,
    );
    await this.geoEntityManager.query(
      `DELETE FROM wdpa
        WHERE wdpa.project_id IN (
          SELECT dp.project_id FROM dangling_projects dp
        );`,
    );
    await this.geoEntityManager.query(
      `DELETE FROM projects_pu ppu
        WHERE ppu.project_id IN (
          SELECT dp.project_id FROM dangling_projects dp
        );`,
    );
  }

  async deleteDanglinScenarioIdsInGeoDb() {
    // For every related entity, we look for matching ids inside entity table
    // and compare it with intermediate dangling_scenarios table to delete records
    await this.geoEntityManager.query(
      `DELETE FROM scenario_features_data sfd
      WHERE sfd.scenario_id IN (
        SELECT ds.scenario_id FROM dangling_scenarios ds
      );`,
    );
    await this.geoEntityManager.query(
      `DELETE FROM blm_final_results bfr
      WHERE bfr.scenario_id IN (
        SELECT ds.scenario_id FROM dangling_scenarios ds
      );`,
    );
    await this.geoEntityManager.query(
      `DELETE FROM blm_partial_results bpr
      WHERE bpr.scenario_id IN (
        SELECT ds.scenario_id FROM dangling_scenarios ds
      );`,
    );
    await this.geoEntityManager.query(
      `DELETE FROM marxan_execution_metadata mem
      WHERE "scenarioId"::uuid IN (
      SELECT ds.scenario_id FROM dangling_scenarios ds
      );`,
    );
    await this.geoEntityManager.query(
      `DELETE FROM scenarios_pu_data spd
      WHERE spd.scenario_id IN (
        SELECT ds.scenario_id FROM dangling_scenarios ds
      );`,
    );
  }

  async deleteDanglingFeatureIdsInGeoDb() {
    // For every related entity, we look for matching ids inside entity table
    // and compare it with intermediate dangling_features table to delete records
    await this.geoEntityManager.query(
      `DELETE FROM features_data fa
      WHERE fa.feature_id IN (
        SELECT df.feature_id FROM dangling_features df
      );`,
    );

    await this.geoEntityManager.query(
      `DELETE FROM feature_amounts_per_planning_unit fappu
      WHERE fappu.feature_id IN (
        SELECT df.feature_id FROM dangling_features df
      );`,
    );
  }

  async deleteDanglingCostSurfacesIdsInGeoDb() {
    await this.geoEntityManager.query(
      `DELETE FROM cost_surface_pu_data cspd
      WHERE cspd.cost_surface_id IN (
        SELECT dcs.cost_surface_id FROM dangling_cost_surfaces dcs
      );`,
    );
  }

  getGeoIdsInUseNotInApiIdsInUse(apiIds: string[], geoIds: string[]) {
    const apiIdsSet = new Set(apiIds);
    const geoIdsSet = new Set(geoIds);

    const geoIdsNotInApiIds = [...geoIdsSet].filter(
      (geoId) => !apiIdsSet.has(geoId),
    );

    return geoIdsNotInApiIds;
  }
}
