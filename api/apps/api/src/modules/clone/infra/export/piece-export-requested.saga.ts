import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ExportComponentRequested } from '@marxan-api/modules/clone/export/domain';
import { SchedulePieceExport } from './schedule-piece-export.command';

@Injectable()
export class PieceExportRequestedSaga {
  @Saga()
  scheduleExport = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ExportComponentRequested),
      map(
        (event) =>
          new SchedulePieceExport(
            event.exportId,
            event.componentId,
            event.resourceId,
            event.piece,
          ),
      ),
    );
}
