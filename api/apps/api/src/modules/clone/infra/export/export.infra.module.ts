import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { ApiEventsModule } from '@marxan-api/modules/api-events';

import { PieceExportRequestedSaga } from './piece-export-requested.saga';
import { ExportStartedSaga } from './export-started.saga';

import { SchedulePieceExportHandler } from './schedule-piece-export.handler';
import {
  exportPieceEventsFactoryProvider,
  exportPiecenQueueEventsProvider,
  exportPieceQueueProvider,
} from './export-queue.provider';
import { ExportPieceEventsHandler } from './export-piece.events-handler';
import { MarkExportAsSubmittedHandler } from './mark-export-as-submitted.handler';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    SchedulePieceExportHandler,
    PieceExportRequestedSaga,
    ExportStartedSaga,
    exportPieceQueueProvider,
    exportPiecenQueueEventsProvider,
    exportPieceEventsFactoryProvider,
    ExportPieceEventsHandler,
    MarkExportAsSubmittedHandler,
  ],
})
export class ExportInfraModule {}
