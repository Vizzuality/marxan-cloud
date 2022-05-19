import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LegacyProjectImportRequested } from '../domain/events/legacy-project-import-requested.event';
import { MarkLegacyProjectImportAsSubmitted } from './mark-legacy-project-as-submitted.command';

@Injectable()
export class LegacyProjectImportRequestedSaga {
  @Saga()
  emitApiEvents = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(LegacyProjectImportRequested),
      map((event) => new MarkLegacyProjectImportAsSubmitted(event.projectId)),
    );
}
