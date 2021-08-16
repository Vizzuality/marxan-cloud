import { SpecificationGotReady } from '@marxan-api/modules/specification/domain';

import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActivateCandidateSpecification } from '../activate-candidate-specification.command';

@Injectable()
export class SpecificationCandidateReadyToActivateSaga {
  @Saga()
  specificationCandidateGotReady = (
    events$: Observable<any>,
  ): Observable<ICommand> => {
    return events$.pipe(
      ofType(SpecificationGotReady),
      map(
        (event: SpecificationGotReady) =>
          new ActivateCandidateSpecification(event.scenarioId, event.id),
      ),
    );
  };
}
