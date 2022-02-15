import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '../../../api-events';
import { QueueApiEventsModule } from '../../../queue-api-events';
import { AllPiecesImportedSaga } from './all-pieces-imported.saga';
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

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    PieceImportRequestedSaga,
    AllPiecesImportedSaga,
    SchedulePieceImportHandler,
    ImportRequestedSaga,
    MarkImportAsSubmittedHandler,
    MarkImportAsFinishedHandler,
    importPieceQueueProvider,
    importPiecenQueueEventsProvider,
    importPieceEventsFactoryProvider,
  ],
})
export class ImportInfraModule {}
