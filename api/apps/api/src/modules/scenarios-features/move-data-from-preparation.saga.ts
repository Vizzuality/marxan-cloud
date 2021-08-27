import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpecificationActivated } from '@marxan-api/modules/scenario-specification';
import { MoveDataFromPreparationCommand } from './move-data-from-preparation.command';

@Injectable()
export class MoveDataFromPreparationSaga {
  @Saga()
  specificationActivated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(SpecificationActivated),
      map(
        (event) =>
          new MoveDataFromPreparationCommand(
            event.scenarioId,
            event.specificationId.value,
          ),
      ),
    );
  };
}
