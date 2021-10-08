import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IntersectWithPlanningUnits } from './intersect-with-planning-units.command';
import { DataMovedFormPreparationEvent } from '@marxan-api/modules/scenarios-features';

@Injectable()
export class DataMovedFormPreparationSaga {
  @Saga()
  featuresReady = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(DataMovedFormPreparationEvent),
      map(
        (event: DataMovedFormPreparationEvent) =>
          new IntersectWithPlanningUnits(
            event.specificationId,
            event.scenarioId,
          ),
      ),
    );
  };
}
