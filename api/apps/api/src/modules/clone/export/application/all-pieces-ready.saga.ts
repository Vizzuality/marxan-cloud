import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ExportAllComponentsFinished } from '@marxan-api/modules/clone/export/domain';
import { FinalizeArchive } from './finalize-archive.command';

@Injectable()
export class AllPiecesReadySaga {
  @Saga()
  finalizeArchive = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ExportAllComponentsFinished),
      map((event) => new FinalizeArchive(event.exportId)),
    );
}
