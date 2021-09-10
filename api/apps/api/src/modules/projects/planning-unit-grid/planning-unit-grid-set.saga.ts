import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CustomPlanningUnitGridSet } from '../events/custom-planning-unit-grid-set.event';
import { SetProjectGridFromShapefile } from './set-project-grid-from-shapefile.command';
import { ProjectId } from './project.id';

export class PlanningUnitGridSetSaga {
  @Saga()
  puGridSet = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(CustomPlanningUnitGridSet),
      map(
        (event) =>
          new SetProjectGridFromShapefile(new ProjectId(event.projectId)),
      ),
    );
}
