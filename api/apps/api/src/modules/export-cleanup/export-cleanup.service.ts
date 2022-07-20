import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ExportCleanup } from './export-cleanup';
import { apiConnections } from '@marxan-api/ormconfig';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { writeFileSync } from 'fs';

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
    const validExportIds = await this.apiEntityManager.query(
      `
      SELECT DISTINCT e.id FROM exports e
        WHERE e.resource_kind = 'project' AND 
        (AGE(NOW(), e.created_at) < $1 OR
        e.resource_id IN (SELECT id FROM published_projects))
      UNION
      SELECT DISTINCT e.id FROM exports e
        WHERE e.resource_kind = 'scenario'
      ORDER BY id;
      `,
      [`${validityIntervalInHours} hours`],
    );

    return validExportIds;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug(
      'Preparing to clean dangling import/export data for projects/scenarios',
    );

    const validResourcesIds = await this.identifyValidResources();
    writeFileSync('../../../../bin/', JSON.stringify(validResourcesIds));
  }
}
