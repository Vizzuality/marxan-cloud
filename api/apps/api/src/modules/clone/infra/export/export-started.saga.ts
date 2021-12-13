import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ExportRequested } from '../../export/domain';
import { NoteExportStarted } from './note-export-started.command';

@Injectable()
export class ExportStartedSaga {
  @Saga()
  emitApiEvents = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ExportRequested),
      map(
        (event) =>
          new NoteExportStarted(
            event.exportId,
            event.resourceId,
            event.resourceKind,
          ),
      ),
    );
}
