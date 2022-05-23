import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LegacyProjectImportPieceRequested } from '../domain/events/legacy-project-import-piece-requested.event';
import { ScheduleLegacyProjectImportPiece } from './schedule-legacy-project-import-piece.command';

@Injectable()
export class LegacyProjectImportPieceRequestedSaga {
  @Saga()
  scheduleExport = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(LegacyProjectImportPieceRequested),
      map(
        (event) =>
          new ScheduleLegacyProjectImportPiece(
            event.projectId,
            event.componentId,
          ),
      ),
    );
}
