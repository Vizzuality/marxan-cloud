import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '../../../api-events';
import { QueueApiEventsModule } from '../../../queue-api-events';
import {
  importPieceEventsFactoryProvider,
  importPiecenQueueEventsProvider,
  importPieceQueueProvider,
} from './import-queue.provider';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    importPieceQueueProvider,
    importPiecenQueueEventsProvider,
    importPieceEventsFactoryProvider,
  ],
})
export class ImportInfraModule {}
