import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkExportAsFailed } from './mark-export-as-failed.command';
import { ExportFailed } from '../../export/application/export-failed.event';
import { RemoveExportFiles } from '@marxan-api/modules/clone/infra/export/remove-export-files.command';

@Injectable()
export class ExportFailedSaga {
  @Saga()
  exportFailedSaga = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ExportFailed),
      mergeMap((event) =>
        of(
          new MarkExportAsFailed(
            event.exportId,
            event.resourceId,
            event.resourceKind,
          ),
          new RemoveExportFiles(event.exportId),
        ),
      ),
    );
}
