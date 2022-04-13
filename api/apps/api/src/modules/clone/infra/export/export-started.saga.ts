import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { ExportRequested } from '../../export/domain';
import { MarkCloneAsSubmitted } from './mark-clone-as-submitted.command';
import { MarkExportAsSubmitted } from './mark-export-as-submitted.command';

@Injectable()
export class ExportStartedSaga {
  @Saga()
  emitApiEvents = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ExportRequested),
      mergeMap(({ exportId, resourceId, resourceKind, importResourceId }) => {
        const isCloning = Boolean(importResourceId);

        return isCloning
          ? of(
              new MarkExportAsSubmitted(exportId, resourceId, resourceKind),
              new MarkCloneAsSubmitted(importResourceId!, resourceKind),
            )
          : of(new MarkExportAsSubmitted(exportId, resourceId, resourceKind));
      }),
    );
}
