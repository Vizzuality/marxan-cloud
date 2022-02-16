import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MarkImportAsFinished } from './mark-import-as-finished.command';
import { AllPiecesImported } from '../../import/domain';

@Injectable()
export class AllPiecesImportedSaga {
  @Saga()
  finalizeArchive = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(AllPiecesImported),
      map((event) => new MarkImportAsFinished(event.importId)),
    );
}
