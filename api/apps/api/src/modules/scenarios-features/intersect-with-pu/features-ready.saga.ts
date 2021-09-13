import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { SpecificationGotReady } from '@marxan-api/modules/specification';
import { map } from 'rxjs/operators';
import { IntersectWithPlanningUnits } from './intersect-with-planning-units.command';

@Injectable()
export class FeaturesReadySaga {
  @Saga()
  featuresReady = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(SpecificationGotReady),
      map(
        (event: SpecificationGotReady) =>
          new IntersectWithPlanningUnits(event.scenarioId),
      ),
    );
  };
}
