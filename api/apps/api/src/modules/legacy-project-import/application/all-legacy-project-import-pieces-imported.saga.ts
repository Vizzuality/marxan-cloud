import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllLegacyProjectImportPiecesImported } from '../domain/events/all-legacy-project-import-pieces-imported.event';
import { MarkLegacyProjectImportAsFinished } from './mark-legacy-project-import-as-finished.command';

@Injectable()
export class AllLegacyProjectImportPiecesImportedSaga {
  @Saga()
  emitApiEvents = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(AllLegacyProjectImportPiecesImported),
      map((event) => new MarkLegacyProjectImportAsFinished(event.projectId)),
    );
}
