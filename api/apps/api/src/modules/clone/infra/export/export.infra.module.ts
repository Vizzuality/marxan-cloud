import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { Logger, Module, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ExportAdaptersModule } from '../../export/adapters/export-adapters.module';
import { ArchiveReadySaga } from './archive-ready.saga';
import { CancelExportPendingJobsHandler } from './cancel-export-pending-jobs.handler';
import { ExportPieceFailedSaga } from './export-piece-failed.saga';
import { ExportPieceEventsHandler } from './export-piece.events-handler';
import {
  exportPieceEventsFactoryProvider,
  exportPiecenQueueEventsProvider,
  exportPieceQueueProvider,
} from './export-queue.provider';
import { ExportStartedSaga } from './export-started.saga';
import { MarkCloneAsSubmittedHandler } from './mark-clone-as-submitted.handler';
import { MarkExportAsFailedHandler } from './mark-export-as-failed.handler';
import { MarkExportAsFinishedHandler } from './mark-export-as-finished.handler';
import { MarkExportAsSubmittedHandler } from './mark-export-as-submitted.handler';
import { MarkExportPiecesAsFailedHandler } from './mark-export-pieces-as-failed.handler';
import { PieceExportRequestedSaga } from './piece-export-requested.saga';
import { SchedulePieceExportHandler } from './schedule-piece-export.handler';

@Module({
  imports: [
    ApiEventsModule,
    QueueApiEventsModule,
    CqrsModule,
    ExportAdaptersModule,
  ],
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
    MarkCloneAsSubmittedHandler,
    MarkExportAsFinishedHandler,
    CancelExportPendingJobsHandler,
    MarkExportAsFailedHandler,
    MarkExportPiecesAsFailedHandler,
    {
      provide: Logger,
      useClass: Logger,
      scope: Scope.TRANSIENT,
    },
  ],
})
export class ExportInfraModule {}
