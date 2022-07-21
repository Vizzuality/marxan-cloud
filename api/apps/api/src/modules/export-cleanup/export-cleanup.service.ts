import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ExportCleanup } from './export-cleanup';
import { apiConnections } from '@marxan-api/ormconfig';
import { AppConfig } from '@marxan-api/utils/config.utils';

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

  async identifyValidResources() {
    const validProjectExportsIdsQuery = `
      SELECT e.id FROM exports e
        WHERE e.resource_kind = 'project' AND 
        (AGE(NOW(), e.created_at) <  INTERVAL $1 HOUR OR
        e.resource_id IN (SELECT id FROM published_projects));
    `;

    const validProjectExportsIds = await this.apiEntityManager.query(
      validProjectExportsIdsQuery,
      [validityIntervalInHours],
    );

    const validScenarioExportsIds = await this.apiEntityManager.query(`
      SELECT e.id FROM exports e
        WHERE e.resource_kind = 'scenario';
    `);

    const uniqueValidExportIds: string[] = [
      ...validProjectExportsIds,
      validScenarioExportsIds,
    ]
      .filter((item, pos, self) => self.indexOf(item) == pos)
      .sort();

    return uniqueValidExportIds;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug(
      'Preparing to clean dangling import/export data for projects/scenarios',
    );

    const validResourcesIds = await this.identifyValidResources();
  }
}
