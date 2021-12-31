import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from '../cost-surface-events.port';
import { ApiEventsService } from '@marxan-api/modules/api-events';

@Injectable()
export class CostSurfaceApiEvents
  extends ApiEventsService
  implements CostSurfaceEventsPort {
  private readonly eventsMap: Record<CostSurfaceState, API_EVENT_KINDS> = {
    [CostSurfaceState.Submitted]:
      API_EVENT_KINDS.scenario__costSurface__submitted__v1_alpha1,
    [CostSurfaceState.ShapefileConverted]:
      API_EVENT_KINDS.scenario__costSurface__shapeConverted__v1_alpha1,
    [CostSurfaceState.ShapefileConversionFailed]:
      API_EVENT_KINDS.scenario__costSurface__shapeConversionFailed__v1_alpha1,
    [CostSurfaceState.CostUpdateFailed]:
      API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
    [CostSurfaceState.Finished]:
      API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
  };

  async event(scenarioId: string, state: CostSurfaceState): Promise<void> {
    await this.create({
      data: {},
      topic: scenarioId,
      kind: this.eventsMap[state],
    });
  }
}
