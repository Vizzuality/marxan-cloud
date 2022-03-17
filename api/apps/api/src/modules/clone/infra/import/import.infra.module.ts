import { FileRepositoryModule } from '@marxan/files-repository';
import { ConsoleLogger, Module, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '../../../api-events';
import { QueueApiEventsModule } from '../../../queue-api-events';
import { ImportAdaptersModule } from '../../import/adapters/import-adapters.module';
import { AllPiecesImportedSaga } from './all-pieces-imported.saga';
import { ImportPieceEventsHandler } from './import-piece.events-handler';
import {
  importPieceEventsFactoryProvider,
  importPiecenQueueEventsProvider,
  importPieceQueueProvider,
} from './import-queue.provider';
import { ImportRequestedSaga } from './import-requested-saga';
import { MarkImportAsFinishedHandler } from './mark-import-as-finished.handler';
import { MarkImportAsSubmittedHandler } from './mark-import-as-submitted.handler';
import { PieceImportRequestedSaga } from './piece-import-requested.saga';
import { SchedulePieceImportHandler } from './schedule-piece-import.handler';
import { UploadExportFileHandler } from './upload-export-file.handler';

@Module({
  imports: [
    ApiEventsModule,
    QueueApiEventsModule,
    CqrsModule,
    ImportAdaptersModule,
    FileRepositoryModule,
  ],
  providers: [
    PieceImportRequestedSaga,
    AllPiecesImportedSaga,
    SchedulePieceImportHandler,
    ImportRequestedSaga,
    MarkImportAsSubmittedHandler,
    MarkImportAsFinishedHandler,
    ImportPieceEventsHandler,
    UploadExportFileHandler,
    {
      provide: ConsoleLogger,
      useClass: ConsoleLogger,
      scope: Scope.TRANSIENT,
    },
    importPieceQueueProvider,
    importPiecenQueueEventsProvider,
    importPieceEventsFactoryProvider,
  ],
})
export class ImportInfraModule {}
