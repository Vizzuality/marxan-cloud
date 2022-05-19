import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { Logger, Module, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LegacyProjectImportBatchFailedSaga } from './legacy-project-import-batch-failed.saga';
import {
  importLegacyProjectPieceEventsFactoryProvider,
  importLegacyProjectPiecenQueueEventsProvider,
  importLegacyProjectPieceQueueProvider,
} from './legacy-project-import-queue.provider';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    importLegacyProjectPieceQueueProvider,
    importLegacyProjectPiecenQueueEventsProvider,
    importLegacyProjectPieceEventsFactoryProvider,
    LegacyProjectImportBatchFailedSaga,
    {
      provide: Logger,
      useClass: Logger,
      scope: Scope.TRANSIENT,
    },
  ],
})
export class LegacyProjectImportInfraModule {}
