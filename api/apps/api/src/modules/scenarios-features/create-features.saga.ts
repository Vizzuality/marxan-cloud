import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { SpecificationCandidateCreated } from '../specification';
import { CreateFeaturesCommand } from './create-features.command';

@Injectable()
export class CreateFeaturesSaga {
  @Saga()
  specificationCandidateCreated = (
    events$: Observable<any>,
  ): Observable<ICommand> => {
    return events$.pipe(
      ofType(SpecificationCandidateCreated),
      filter((event) => !event.draft),
      mergeMap((event) =>
        event.input.map(
          (input) =>
            new CreateFeaturesCommand(
              event.scenarioId,
              event.specificationId,
              input,
              event.doNotCalculateAreas,
            ),
        ),
      ),
    );
  };
}
