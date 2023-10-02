import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScheduleCleanupForCostSurfaceUnusedResources } from '@marxan-api/modules/cost-surface/delete-cost-surface/schedule-cost-surface-unused-resources-cleanup.command';
import { CostSurfaceDeleted } from '@marxan-api/modules/cost-surface/events/cost-surface-deleted.event';

@Injectable()
export class CostSurfaceDeletedSaga {
  @Saga()
  costSurfaceDeletedDefault = (
    events$: Observable<any>,
  ): Observable<ICommand> =>
    events$.pipe(
      ofType(CostSurfaceDeleted),
      map(
        (event) =>
          new ScheduleCleanupForCostSurfaceUnusedResources(event.costSurfaceId),
      ),
    );
}
