import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CleanupTasks } from './cleanup-tasks';
import { chunk } from 'lodash';
import { ProjectUnusedResources } from '../unused-resources-cleanup/delete-unused-resources/project-unused-resources';
import { ScenarioUnusedResources } from '../unused-resources-cleanup/delete-unused-resources/scenario-unused-resources';

const CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS = 1000;
interface entitiesWithProjectId {
  project_id: string;
}
interface entitiesWithScenarioId {
  scenario_id: string;
}

@Injectable()
export class CleanupTasksService implements CleanupTasks {
  private readonly logger = new Logger(CleanupTasksService.name);
  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly geoEntityManager: EntityManager,
    private readonly projectUnusedResources: ProjectUnusedResources,
    private readonly scenarioUnusedResources: ScenarioUnusedResources,
  ) {}

  async nukeProjectsDanglingData() {
    const projectIds = await this.apiEntityManager
      .createQueryBuilder()
      .from('projects', 'p')
      .select(['id'])
      .getRawMany()
      .then((result) => result.map((i) => i.id))
      .catch((error) => {
        throw new Error(error);
      });

    await this.geoEntityManager.transaction(async (entityManager) => {
      await this.geoEntityManager.query(
        `TRUNCATE TABLE project_nuke_preparation`,
      );

      for (const [, summaryChunks] of chunk(
        projectIds,
        CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
      ).entries()) {
        await entityManager.insert(
          'project_nuke_preparation',
          summaryChunks.map((chunk: string) => ({
            project_id: chunk,
          })),
        );
      }

      const missingProjectIdsFromPlanningAreas: entitiesWithProjectId[] = await this.geoEntityManager.query(
        `SELECT pa.project_id
        FROM planning_areas pa
        LEFT JOIN project_nuke_preparation pnp ON pnp.project_id = pa.project_id
        WHERE pnp.project_id IS NULL`,
      );
      const missingProjectIdsFromProtectedAreas: entitiesWithProjectId[] = await this.geoEntityManager.query(
        `SELECT wdpa.project_id
        FROM wdpa
        LEFT JOIN project_nuke_preparation pnp ON pnp.project_id = wdpa.project_id
        WHERE pnp.project_id IS NULL`,
      );
      const missingProjectIdsFromProjectsPlanningUnits: entitiesWithProjectId[] = await this.geoEntityManager.query(
        `SELECT ppu.project_id
        FROM projects_pu ppu
        LEFT JOIN project_nuke_preparation pnp ON pnp.project_id = ppu.project_id
        WHERE pnp.project_id IS NULL`,
      );

      const notMatchingProjectIds: string[] = [];

      notMatchingProjectIds.push(
        ...missingProjectIdsFromPlanningAreas.map((p) => p.project_id),
        ...missingProjectIdsFromProtectedAreas.map((p) => p.project_id),
        ...missingProjectIdsFromProjectsPlanningUnits.map((p) => p.project_id),
      );

      await notMatchingProjectIds.map(async (projectId) => {
        await this.projectUnusedResources.removeUnusedResources(projectId, {
          projectCustomFeaturesIds: [''],
        });
        return projectId;
      });

      await this.geoEntityManager.query(
        `TRUNCATE TABLE project_nuke_preparation`,
      );
    });
  }

  async nukeScenariosDanglingData() {
    const scenarioIds = await this.apiEntityManager
      .createQueryBuilder()
      .from('scenarios', 'p')
      .select(['id'])
      .getRawMany()
      .then((result) => result.map((i) => i.id))
      .catch((error) => {
        throw new Error(error);
      });

    //   await this.scenarioPuDataRepo.delete({ scenarioId });

    await this.geoEntityManager.transaction(async (entityManager) => {
      await this.geoEntityManager.query(
        `TRUNCATE TABLE scenario_nuke_preparation`,
      );

      for (const [, summaryChunks] of chunk(
        scenarioIds,
        CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
      ).entries()) {
        await entityManager.insert(
          'scenario_nuke_preparation',
          summaryChunks.map((chunk: string) => ({
            scenario_id: chunk,
          })),
        );
      }

      const missingScenarioIdsFromScenarioFeaturesData: entitiesWithScenarioId[] = await this.geoEntityManager.query(
        `SELECT sfd.scenario_id
          FROM scenario_features_data sfd
          LEFT JOIN scenario_nuke_preparation snp ON snp.scenario_id = sfd.scenario_id
          WHERE snp.scenario_id IS NULL`,
      );
      const missingScenarioIdsFromBlmFinalResults: entitiesWithScenarioId[] = await this.geoEntityManager.query(
        `SELECT bfr.scenario_id
          FROM blm_final_results bfr
          LEFT JOIN scenario_nuke_preparation snp ON snp.scenario_id = bfr.scenario_id
          WHERE snp.scenario_id IS NULL`,
      );
      const missingScenarioIdsFromBlmPartialResults: entitiesWithScenarioId[] = await this.geoEntityManager.query(
        `SELECT bpr.scenario_id
          FROM blm_final_results bpr
          LEFT JOIN scenario_nuke_preparation snp ON snp.scenario_id = bpr.scenario_id
          WHERE snp.scenario_id IS NULL`,
      );
      const missingScenarioIdsFromMarxanExecutionMetadata: entitiesWithScenarioId[] = await this.geoEntityManager.query(
        `SELECT mem.scenarioId
          FROM marxan_execution_metadata mem
          LEFT JOIN scenario_nuke_preparation snp ON snp.scenario_id = mem.scenarioId
          WHERE snp.scenario_id IS NULL`,
      );
      const missingScenarioIdsFromScenariosPuData: entitiesWithScenarioId[] = await this.geoEntityManager.query(
        `SELECT spd.scenario_id
          FROM scenarios_pu_data spd
          LEFT JOIN scenario_nuke_preparation snp ON snp.scenario_id = spd.scenario_id
          WHERE snp.scenario_id IS NULL`,
      );

      const notMatchingScenarioIds: string[] = [];

      notMatchingScenarioIds.push(
        ...missingScenarioIdsFromScenarioFeaturesData.map((p) => p.scenario_id),
        ...missingScenarioIdsFromBlmFinalResults.map((p) => p.scenario_id),
        ...missingScenarioIdsFromBlmPartialResults.map((p) => p.scenario_id),
        ...missingScenarioIdsFromMarxanExecutionMetadata.map(
          (p) => p.scenario_id,
        ),
        ...missingScenarioIdsFromScenariosPuData.map((p) => p.scenario_id),
      );

      await notMatchingScenarioIds.map(async (scenarioId) => {
        await this.scenarioUnusedResources.removeUnusedResources(scenarioId);
        return scenarioId;
      });

      await this.geoEntityManager.query(
        `TRUNCATE TABLE scenario_nuke_preparation`,
      );
    });
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug(
      'Preparing to clean dangling geo data for projects/scenarios',
    );

    await this.nukeProjectsDanglingData();
    await this.nukeScenariosDanglingData();
  }
}
