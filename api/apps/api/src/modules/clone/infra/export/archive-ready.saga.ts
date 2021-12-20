import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ArchiveReady } from '../../export/domain';
import { MarkExportAsFinished } from './mark-export-as-finished.command';

@Injectable()
export class ArchiveReadySaga {
  @Saga()
  emitApiEvents = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ArchiveReady),
      map(
        (event) =>
          new MarkExportAsFinished(
            event.exportId,
            event.resourceId,
            event.resourceKind,
          ),
      ),
    );
}
