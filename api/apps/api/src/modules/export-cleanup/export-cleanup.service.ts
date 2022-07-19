import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ExportCleanup } from './export-cleanup';
import { apiConnections } from '@marxan-api/ormconfig';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { execSync } from 'child_process';

const validityIntervalInHours = AppConfig.get<string>(
  'storage.cloningFileStorage.artifactValidityInHours',
);

@Injectable()
export class ExportCleanupService implements ExportCleanup {
  private readonly logger = new Logger(ExportCleanupService.name);
  constructor(
    @InjectEntityManager(apiConnections.default)
    private readonly apiEntityManager: EntityManager,
  ) {}

  async identifyExpiredResources() {
    const expiredProjectExportsIds = await this.apiEntityManager.query(`
      SELECT e.id FROM exports e
        WHERE e.resource_kind = 'project' AND 
        WHERE e.created_at > NOW() - INTERVAL ${validityIntervalInHours} HOUR) AND
        WHERE e.resource_id NOT IN (SELECT id FROM published_projects);
    `);

    const expiredScenarioExportsIds = await this.apiEntityManager.query(`
      SELECT e.id FROM exports e
        WHERE e.resource_kind = 'scenario';
    `);

    const uniqueExpiredExportIds: string[] = [
      ...expiredProjectExportsIds,
      expiredScenarioExportsIds,
    ]
      .filter((item, pos, self) => self.indexOf(item) == pos)
      .sort();

    return uniqueExpiredExportIds;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug(
      'Preparing to clean dangling import/export data for projects/scenarios',
    );

    const expiredResourcesIds = await this.identifyExpiredResources();

    // await this.deleteExpiredResources(expiredResourcesIds);
  }
}
