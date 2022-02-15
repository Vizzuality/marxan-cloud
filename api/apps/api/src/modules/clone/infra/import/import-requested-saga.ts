import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImportRequested } from '../../import/domain';
import { MarkImportAsSubmitted } from './mark-import-as-submitted.command';

@Injectable()
export class ImportRequestedSaga {
  @Saga()
  emitApiEvents = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ImportRequested),
      map(
        (event) =>
          new MarkImportAsSubmitted(
            event.id,
            event.resourceId,
            event.resourceKind,
          ),
      ),
    );
}
