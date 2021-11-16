import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';

import { SelectionChangedEvent } from './selection-changed.event';
import { UpdatePlanningUnitsCommand } from './update-planning-units.command';

@Injectable()
export class SelectionChangedSaga {
  @Saga()
  selectionChanged = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(SelectionChangedEvent),
      map(
        (event) =>
          new UpdatePlanningUnitsCommand(
            event.scenarioId,
            event.threshold,
            event.protectedAreasIds,
          ),
      ),
    );
}
