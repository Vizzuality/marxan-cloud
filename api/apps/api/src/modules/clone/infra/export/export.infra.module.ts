import { Logger, Module } from '@nestjs/common';
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
import { MarkExportAsFinishedHandler } from './mark-export-as-finished.handler';
import { ArchiveReadySaga } from './archive-ready.saga';
import { ExportPieceFailedSaga } from './export-piece-failed.saga';
import { CancelExportPendingJobsHandler } from './cancel-export-pending-jobs.handler';
import { MarkExportAsFailedHandler } from './mark-export-as-failed.handler';
import { MarkExportPiecesAsFailedHandler } from './mark-export-pieces-as-failed.handler';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    SchedulePieceExportHandler,
    PieceExportRequestedSaga,
    ExportStartedSaga,
    ExportPieceFailedSaga,
    ArchiveReadySaga,
    exportPieceQueueProvider,
    exportPiecenQueueEventsProvider,
    exportPieceEventsFactoryProvider,
    ExportPieceEventsHandler,
    MarkExportAsSubmittedHandler,
    MarkExportAsFinishedHandler,
    CancelExportPendingJobsHandler,
    MarkExportAsFailedHandler,
    MarkExportPiecesAsFailedHandler,
    Logger,
  ],
})
export class ExportInfraModule {}
