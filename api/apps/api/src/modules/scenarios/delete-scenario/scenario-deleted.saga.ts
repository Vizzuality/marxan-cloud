import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ScenarioDeleted } from '../events/scenario-deleted.event';
import { ScheduleCleanupForScenarioUnusedResources } from './schedule-scenario-unused-resources-cleanup.command';

@Injectable()
export class ScenarioDeletedSaga {
  @Saga()
  scenarioDeletedDefault = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ScenarioDeleted),
      map(
        (event) =>
          new ScheduleCleanupForScenarioUnusedResources(event.scenarioId),
      ),
    );
}
