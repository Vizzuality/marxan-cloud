import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PlanningUnitSet } from '@marxan/planning-units-grid';

import { SetProjectBlm } from './set-project-blm';

@Injectable()
export class ProjectBlmSaga {
  @Saga()
  calculateBlmDefaults = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(PlanningUnitSet),
      map((event) => new SetProjectBlm(event.projectId)),
    );
}
