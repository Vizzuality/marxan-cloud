import { SpecificationCandidateCreated } from '@marxan-api/modules/specification/domain';

import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AssignCandidateSpecification } from '../assign-candidate-specification.command';

@Injectable()
export class SpecificationCandidateCreatedSaga {
  @Saga()
  specificationCandidateCreated = (
    events$: Observable<any>,
  ): Observable<ICommand> => {
    return events$.pipe(
      ofType(SpecificationCandidateCreated),
      map(
        (event) =>
          new AssignCandidateSpecification(
            event.scenarioId,
            event.specificationId,
          ),
      ),
    );
  };
}
