import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';

import { ProtectedAreaUnlinked } from '../protected-area-unlinked';
import { CollectGarbage } from './collect-garbage.command';

@Injectable()
export class ProtectedAreaUnlinkedSaga {
  @Saga()
  protectedAreaUnlinked = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ProtectedAreaUnlinked),
      map((event) => new CollectGarbage(event.id, event.projectId)),
    );
}
