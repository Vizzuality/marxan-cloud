import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProjectDeleted } from '../events/project-deleted.event';
import { ScheduleCleanupForProjectUnusedResources } from './schedule-project-unused-resources-cleanup.command';

@Injectable()
export class ProjectDeletedSaga {
  @Saga()
  projectDeletedDefault = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(ProjectDeleted),
      map(
        (event) =>
          new ScheduleCleanupForProjectUnusedResources(
            event.projectId,
            event.scenarioIds,
            event.projectCustomFeaturesIds,
          ),
      ),
    );
}
