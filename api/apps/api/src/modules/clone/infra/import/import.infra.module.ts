import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '../../../api-events';
import { QueueApiEventsModule } from '../../../queue-api-events';
import {
  importPieceEventsFactoryProvider,
  importPiecenQueueEventsProvider,
  importPieceQueueProvider,
} from './import-queue.provider';
import { PieceImportRequestedSaga } from './piece-import-requested.saga';
import { SchedulePieceImportHandler } from './schedule-piece-import.handler';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    PieceImportRequestedSaga,
    SchedulePieceImportHandler,
    importPieceQueueProvider,
    importPiecenQueueEventsProvider,
    importPieceEventsFactoryProvider,
  ],
})
export class ImportInfraModule {}
