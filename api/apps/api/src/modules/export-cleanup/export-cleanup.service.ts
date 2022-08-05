import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ExportCleanup } from './export-cleanup';
import { apiConnections } from '@marxan-api/ormconfig';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { spawn } from 'child_process';

const validityIntervalInHours = AppConfig.get<string>(
  'storage.cloningFileStorage.artifactValidityInHours',
);

const cronJobInterval: string = AppConfig.get(
  'storage.cloningFileStorage.cleanupCronJobSettings.interval',
);

const cleanupTemporaryFolders = AppConfig.getBoolean(
  'storage.cloningFileStorage.cleanupTemporaryFolders',
  true,
);

@Injectable()
export class ExportCleanupService implements ExportCleanup {
  private readonly logger = new Logger(ExportCleanupService.name);
  constructor(
    @InjectEntityManager(apiConnections.default)
    private readonly apiEntityManager: EntityManager,
  ) {}

  async identifyValidResources() {
    /**
     * We consider as _valid_:
     *
     * - exports of projects that have been created less than
     *   validityIntervalInHours ago
     * - exports of published projects (these should be deleted only when a
     *   project is unpublished)
     * - exports of scenarios, because we should never leave them around for
     *   later use/download - they cannot be downloaded and are only created in
     *   order to allow cloning of a scenario, so as long as they get cleaned
     *   up at the end of a scenario cloning operation, we should leave them
     *   alone: if they are on disk, we should assume that they are used by
     *   a scenario cloning operation which is in progress
     */
    const validExportIds = await this.apiEntityManager
      .query(
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
      )
      .then((ids: { id: string }[]) => ids.map((i) => i.id).join('\n'));

    return validExportIds;
  }

  private cleanupDanglingExports(validResourcesIds: string) {
    const cleanupArg = cleanupTemporaryFolders
      ? ['--cleanup-temporary-folders']
      : [];

    const cleanupTask = spawn(
      '/opt/marxan-api/bin/cleanup-obsolete-export-artifacts',
      cleanupArg,
    );
    cleanupTask.stdin.write(validResourcesIds);
    cleanupTask.stdin.end();
  }

  @Cron(cronJobInterval)
  async handleCron() {
    this.logger.log(
      'Preparing to clean expired/obsolete artifacts for project exports',
    );

    const validResourcesIds = await this.identifyValidResources();

    this.cleanupDanglingExports(validResourcesIds);
  }
}
