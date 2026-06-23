import { BootstrapConsole, ConsoleModule } from 'nestjs-console';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { DeleteProjectModule } from '@marxan-api/modules/projects/delete-project/delete-project.module';
import { BlockGuardModule } from '@marxan-api/modules/projects/block-guard/block-guard.module';
import { BulkUserDeletionCommand } from './bulk-user-deletion.command';

/**
 * Dedicated, lightweight console entry for the MRXNM-72 bulk-deletion command.
 *
 * Kept separate from the shared `console.ts` for two reasons learned on staging:
 *  - running the full app context (ts-node) inside the serving api pod OOM-kills
 *    its 4Gi container, so this MUST be run in a DEDICATED one-off pod/Job;
 *  - this module imports only `DeleteProjectModule` (DeleteProject handler + the
 *    ProjectDeleted saga + the unused-resources cleanup queue, via its
 *    QueueApiEventsModule re-export of QueueBuilder) and `BlockGuardModule`,
 *    rather than all of `ProjectsModule`, to keep the bootstrap footprint small
 *    and avoid bloating the shared `create:user` console.
 *
 * Run (in a dedicated pod with the deployed image):
 *   yarn console:bulk-deletion --emails <path> --out <dir> --env <env> [--apply]
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({ ...apiConnections.default, keepConnectionAlive: true }),
    TypeOrmModule.forRoot({ ...apiConnections.geoprocessingDB, keepConnectionAlive: true }),
    ConsoleModule,
    CqrsModule,
    DeleteProjectModule,
    BlockGuardModule,
  ],
  providers: [BulkUserDeletionCommand],
  exports: [BulkUserDeletionCommand],
})
export class BulkUserDeletionConsoleModule {}

const bootstrap = new BootstrapConsole({
  module: BulkUserDeletionConsoleModule,
  useDecorators: true,
});
bootstrap.init().then(async (app) => {
  try {
    await app.init();
    await bootstrap.boot();
    await app.close();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    await app.close();
    process.exit(1);
  }
});
