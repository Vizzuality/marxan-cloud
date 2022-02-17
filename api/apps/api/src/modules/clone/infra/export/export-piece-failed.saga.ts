import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ExportPieceFailed } from '../../export/application/export-piece-failed.event';
import { CancelExportPendingJobs } from './cancel-export-pending-jobs.command';
import { MarkExportAsFailed } from './mark-export-as-failed.command';

@Injectable()
export class ExportPieceFailedSaga {
  @Saga()
  exportPieceFailedSaga = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ExportPieceFailed),
      mergeMap((event) =>
        of(
          new MarkExportAsFailed(event.exportId),
          new CancelExportPendingJobs(event.exportId),
        ),
      ),
    );
}
