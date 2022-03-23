import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ImportBatchFailed } from '../../import/domain/events/import-batch-failed.event';
import { MarkImportAsFailed } from './mark-import-as-failed.command';

@Injectable()
export class ImportBatchFailedSaga {
  @Saga()
  finalizeArchive = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ImportBatchFailed),
      mergeMap((event) =>
        of(
          new MarkImportAsFailed(
            event.importId,
            `${event.batchNumber} batch contains failed pieces`,
          ),
        ),
      ),
    );
}
