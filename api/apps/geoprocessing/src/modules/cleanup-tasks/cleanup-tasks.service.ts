import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CleanupTasks } from './cleanup-tasks';
import { chunk } from 'lodash';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';

const CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS = 1000;
const cronJobInterval: string = AppConfig.get(
  'cleanupCronJobSettings.interval',
);
@Injectable()
export class CleanupTasksService implements CleanupTasks {
  private readonly logger = new Logger(CleanupTasksService.name);
  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly geoEntityManager: EntityManager,
  ) {}

  async cleanupProjectsDanglingData() {
    // Find all existing projects in API DB and return an array of their IDs
    const projectIds = await this.apiEntityManager
      .createQueryBuilder()
      .from('projects', 'p')
      .select(['id'])
      .getRawMany()
      .then((result) => result.map((i) => i.id))
      .catch((error) => {
        throw new Error(error);
      });

    // Start cleaning up process inside transaction
    await this.geoEntityManager.transaction(async (entityManager) => {
      // Truncate table to be sure that not any projectId is inside before operation
      await this.geoEntityManager.query(
        `TRUNCATE TABLE project_geodata_cleanup_preparation;`,
      );

      // Set batches to insert ids in intermediate table for processing
      for (const [, summaryChunks] of chunk(
        projectIds,
        CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
      ).entries()) {
        await entityManager.insert(
          'project_geodata_cleanup_preparation',
          summaryChunks.map((chunk: string) => ({
            project_id: chunk,
          })),
        );
      }

      // For every related entity, we look for non-matching ids inside entity table
      // and compare it with intermediate projectId table to delete records that are not there
      await this.geoEntityManager.query(
        `DELETE FROM planning_areas pa
        WHERE pa.project_id IS NOT NULL
        AND pa.project_id NOT IN (
          SELECT pgcp.project_id FROM project_geodata_cleanup_preparation pgcp
        );`,
      );
      await this.geoEntityManager.query(
        `DELETE FROM wdpa
        WHERE wdpa.project_id IS NOT NULL
        AND wdpa.project_id NOT IN (
          SELECT pgcp.project_id FROM project_geodata_cleanup_preparation pgcp
        );`,
      );
      await this.geoEntityManager.query(
        `DELETE FROM projects_pu ppu
        WHERE ppu.project_id IS NOT NULL
        AND ppu.project_id NOT IN (
          SELECT pgcp.project_id FROM project_geodata_cleanup_preparation pgcp
        );`,
      );
      await this.apiEntityManager.query(
        `DELETE FROM features_data fd
        WHERE fd.project_id IS NOT NULL
        AND fd.project_id NOT IN (
          SELECT p.id FROM projects
        );`,
      );

      await this.geoEntityManager.query(
        `TRUNCATE TABLE project_geodata_cleanup_preparation;`,
      );
    });
  }

  async cleanupScenariosDanglingData() {
    const scenarioIds = await this.apiEntityManager
      .createQueryBuilder()
      .from('scenarios', 'p')
      .select(['id'])
      .getRawMany()
      .then((result) => result.map((i) => i.id))
      .catch((error) => {
        throw new Error(error);
      });

    await this.geoEntityManager.transaction(async (entityManager) => {
      await this.geoEntityManager.query(
        `TRUNCATE TABLE scenario_geodata_cleanup_preparation;`,
      );

      for (const [, summaryChunks] of chunk(
        scenarioIds,
        CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
      ).entries()) {
        await entityManager.insert(
          'scenario_geodata_cleanup_preparation',
          summaryChunks.map((chunk: string) => ({
            scenario_id: chunk,
          })),
        );
      }

      await this.geoEntityManager.query(
        `DELETE FROM scenario_features_data sfd
        WHERE sfd.scenario_id IS NOT NULL
        AND sfd.scenario_id NOT IN (
          SELECT sgcp.scenario_id FROM scenario_geodata_cleanup_preparation sgcp
        );`,
      );
      await this.geoEntityManager.query(
        `DELETE FROM blm_final_results bfr
        WHERE bfr.scenario_id IS NOT NULL
        AND bfr.scenario_id NOT IN (
          SELECT sgcp.scenario_id FROM scenario_geodata_cleanup_preparation sgcp
        );`,
      );
      await this.geoEntityManager.query(
        `DELETE FROM blm_partial_results bpr
        WHERE bpr.scenario_id IS NOT NULL
        AND bpr.scenario_id NOT IN (
          SELECT sgcp.scenario_id FROM scenario_geodata_cleanup_preparation sgcp
        );`,
      );
      await this.geoEntityManager.query(
        `DELETE FROM marxan_execution_metadata mem
        WHERE mem.scenarioId IS NOT NULL
        AND mem.scenarioId NOT IN (
          SELECT sgcp.scenario_id FROM scenario_geodata_cleanup_preparation sgcp
        );`,
      );
      await this.geoEntityManager.query(
        `DELETE FROM scenarios_pu_data spd
        WHERE spd.scenario_id IS NOT NULL
        AND spd.scenario_id NOT IN (
          SELECT sgcp.scenario_id FROM scenario_geodata_cleanup_preparation sgcp
        );`,
      );

      await this.geoEntityManager.query(
        `TRUNCATE TABLE scenario_geodata_cleanup_preparation;`,
      );
    });
  }

  async cleanupFeaturesDanglingData() {
    const featureIds = await this.apiEntityManager
      .createQueryBuilder()
      .from('features', 'f')
      .select(['id'])
      .getRawMany()
      .then((result) => result.map((i) => i.id))
      .catch((error) => {
        throw new Error(error);
      });

    await this.geoEntityManager.transaction(async (entityManager) => {
      await this.geoEntityManager.query(
        `TRUNCATE TABLE features_data_cleanup_preparation;`,
      );

      for (const [, summaryChunks] of chunk(
        featureIds,
        CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
      ).entries()) {
        await entityManager.insert(
          'features_data_cleanup_preparation',
          summaryChunks.map((chunk: string) => ({
            id: chunk,
          })),
        );
      }

      await this.geoEntityManager.query(
        `DELETE FROM features_data fa
        WHERE fa.feature_id NOT IN (
          SELECT fdcp.id FROM features_data_cleanup_preparation fdcp
        );`,
      );

      await this.geoEntityManager.query(
        `TRUNCATE TABLE features_data_cleanup_preparation;`,
      );
    });
  }

  @Cron(cronJobInterval)
  async handleCron() {
    this.logger.debug(
      'Preparing to clean dangling geo data for projects/scenarios',
    );

    await this.cleanupProjectsDanglingData();
    await this.cleanupScenariosDanglingData();
    await this.cleanupFeaturesDanglingData();
  }
}
