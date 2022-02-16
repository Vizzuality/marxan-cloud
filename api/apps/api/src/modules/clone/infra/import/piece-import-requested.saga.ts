import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PieceImportRequested } from '@marxan-api/modules/clone/import/domain';
import { SchedulePieceImport } from './schedule-piece-import.command';

@Injectable()
export class PieceImportRequestedSaga {
  @Saga()
  scheduleImport = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(PieceImportRequested),
      map(
        (event) => new SchedulePieceImport(event.importId, event.componentId),
      ),
    );
}
