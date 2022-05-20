import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { Logger, Module, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { failedLegacyProjectImportDbCleanupQueueProvider } from './failed-legacy-project-import-db-cleanup-queue.provider';
import { LegacyProjectImportBatchFailedSaga } from './legacy-project-import-batch-failed.saga';
import {
  importLegacyProjectPieceEventsFactoryProvider,
  importLegacyProjectPiecenQueueEventsProvider,
  importLegacyProjectPieceQueueProvider,
} from './legacy-project-import-queue.provider';
import { ScheduleDbCleanupForFailedLegacyProjectImportHandler } from './schedule-db-cleanup-for-failed-legacy-project-import.handler';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    importLegacyProjectPieceQueueProvider,
    importLegacyProjectPiecenQueueEventsProvider,
    importLegacyProjectPieceEventsFactoryProvider,
    failedLegacyProjectImportDbCleanupQueueProvider,
    LegacyProjectImportBatchFailedSaga,
    ScheduleDbCleanupForFailedLegacyProjectImportHandler,
    {
      provide: Logger,
      useClass: Logger,
      scope: Scope.TRANSIENT,
    },
  ],
})
export class LegacyProjectImportInfraModule {}
