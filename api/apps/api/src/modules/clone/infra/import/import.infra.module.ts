import { CloningFileSRepositoryModule } from '@marxan/cloning-files-repository';
import { Logger, Module, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '../../../api-events';
import { QueueApiEventsModule } from '../../../queue-api-events';
import { ExportAdaptersModule } from '../../export/adapters/export-adapters.module';
import { ImportAdaptersModule } from '../../import/adapters/import-adapters.module';
import { ExportConfigReader } from '../../import/application/export-config-reader';
import { AllPiecesImportedSaga } from './all-pieces-imported.saga';
import { failedImportDbCleanupQueueProvider } from './failed-import-db-cleanup-queue.provider';
import { GenerateExportFromZipFileHandler } from './generate-export-from-zip-file.handler';
import { ImportBatchFailedSaga } from './import-batch-failed.saga';
import { ImportPieceEventsHandler } from './import-piece.events-handler';
import {
  importPieceEventsFactoryProvider,
  importPiecenQueueEventsProvider,
  importPieceQueueProvider,
} from './import-queue.provider';
import { ImportRequestedSaga } from './import-requested-saga';
import { MarkCloneAsFinishedHandler } from './mark-clone-as-finished.handler';
import { MarkImportAsFailedHandler } from './mark-import-as-failed.handler';
import { MarkImportAsFinishedHandler } from './mark-import-as-finished.handler';
import { MarkImportAsSubmittedHandler } from './mark-import-as-submitted.handler';
import { MarkImportPieceAsFailedHandler } from './mark-import-piece-as-failed.handler';
import { PieceImportRequestedSaga } from './piece-import-requested.saga';
import { ScheduleDbCleanupForFailedImportHandler } from './schedule-db-cleanup-for-failed-import.handler';
import { SchedulePieceImportHandler } from './schedule-piece-import.handler';

@Module({
  imports: [
    ApiEventsModule,
    QueueApiEventsModule,
    CqrsModule,
    ImportAdaptersModule,
    ExportAdaptersModule,
    CloningFileSRepositoryModule,
  ],
  providers: [
    ExportConfigReader,
    PieceImportRequestedSaga,
    AllPiecesImportedSaga,
    ImportBatchFailedSaga,
    SchedulePieceImportHandler,
    ImportRequestedSaga,
    MarkImportAsSubmittedHandler,
    MarkImportAsFinishedHandler,
    MarkCloneAsFinishedHandler,
    MarkImportAsFailedHandler,
    MarkImportPieceAsFailedHandler,
    ImportPieceEventsHandler,
    ScheduleDbCleanupForFailedImportHandler,
    GenerateExportFromZipFileHandler,
    {
      provide: Logger,
      useClass: Logger,
      scope: Scope.TRANSIENT,
    },
    importPieceQueueProvider,
    importPiecenQueueEventsProvider,
    importPieceEventsFactoryProvider,
    failedImportDbCleanupQueueProvider,
  ],
})
export class ImportInfraModule {}
