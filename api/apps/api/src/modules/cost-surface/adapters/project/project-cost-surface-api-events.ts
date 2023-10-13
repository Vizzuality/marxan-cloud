import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';

import {
  ProjectCostSurfaceEventsPort,
  ProjectCostSurfaceState,
} from '@marxan-api/modules/cost-surface/ports/project/project-cost-surface-events.port';
import { ApiEventsService } from '@marxan-api/modules/api-events';

@Injectable()
export class ProjectCostSurfaceApiEvents
  extends ApiEventsService
  implements ProjectCostSurfaceEventsPort
{
  private readonly eventsMap: Record<ProjectCostSurfaceState, API_EVENT_KINDS> =
    {
      [ProjectCostSurfaceState.ShapefileSubmitted]:
        API_EVENT_KINDS.project__costSurface_shapefile_submitted__v1alpha1,
      [ProjectCostSurfaceState.ShapefileConverted]:
        API_EVENT_KINDS.project__costSurface_shapeConverted__v1alpha1,
      [ProjectCostSurfaceState.ShapefileConversionFailed]:
        API_EVENT_KINDS.project__costSurface_shapeConversionFailed__v1alpha1,
      [ProjectCostSurfaceState.CostUpdateFailed]:
        API_EVENT_KINDS.project__costSurface_shapefile_failed__v1alpha1,
      [ProjectCostSurfaceState.CostUpdateFinished]:
        API_EVENT_KINDS.project__costSurface_shapefile_finished__v1alpha1,
    };

  async event(
    projectId: string,
    state: ProjectCostSurfaceState,
    context?: Record<string, unknown>,
  ): Promise<void> {
    await this.create({
      data: context ?? {},
      topic: projectId,
      kind: this.eventsMap[state],
    });
  }
}
