import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { Logger, Module, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  importLegacyProjectPieceQueueProvider,
  importLegacyProjectPiecenQueueEventsProvider,
  importLegacyProjectPieceEventsFactoryProvider,
} from './legacy-project-import-queue.provider';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    importLegacyProjectPieceQueueProvider,
    importLegacyProjectPiecenQueueEventsProvider,
    importLegacyProjectPieceEventsFactoryProvider,
    {
      provide: Logger,
      useClass: Logger,
      scope: Scope.TRANSIENT,
    },
  ],
})
export class LegacyProjectImportInfraModule {}
