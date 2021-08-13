import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SpecificationCandidateCreated } from '../specification';
import { CreateFeaturesCommand } from './create-features.command';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateFeaturesSaga {
  @Saga()
  specificationCandidateCreated = (
    events$: Observable<any>,
  ): Observable<ICommand> => {
    return events$.pipe(
      ofType(SpecificationCandidateCreated),
      mergeMap((event) =>
        event.input.map(
          (input) => new CreateFeaturesCommand(event.scenarioId, input),
        ),
      ),
    );
  };
}
