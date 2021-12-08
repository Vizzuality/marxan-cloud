import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';

import { PieceExportRequestedSaga } from './piece-export-requested.saga';
import { SchedulePieceExportHandler } from './schedule-piece-export.handler';
import {
  exportPieceEventsFactoryProvider,
  exportPiecenQueueEventsProvider,
  exportPieceQueueProvider,
} from './export-queue.provider';
import { ExportPieceEventsHandler } from './export-piece.events-handler';

@Module({
  imports: [QueueApiEventsModule, CqrsModule],
  providers: [
    SchedulePieceExportHandler,
    PieceExportRequestedSaga,
    exportPieceQueueProvider,
    exportPiecenQueueEventsProvider,
    exportPieceEventsFactoryProvider,
    ExportPieceEventsHandler,
  ],
})
export class ExportInfraModule {}
