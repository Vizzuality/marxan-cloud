import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import {
  ScenarioCostSurfaceEventsPort,
  ScenarioCostSurfaceState,
} from '@marxan-api/modules/cost-surface/ports/scenario/scenario-cost-surface-events.port';

@Injectable()
export class ScenarioCostSurfaceApiEvents
  extends ApiEventsService
  implements ScenarioCostSurfaceEventsPort {
  private readonly eventsMap: Record<
    ScenarioCostSurfaceState,
    API_EVENT_KINDS
  > = {
    [ScenarioCostSurfaceState.LinkToScenarioFailed]:
      API_EVENT_KINDS.scenario__costSurface__link__failed__v1_alpha1,
    [ScenarioCostSurfaceState.LinkToScenarioFinished]:
      API_EVENT_KINDS.scenario__costSurface__link__finished__v1_alpha1,
    [ScenarioCostSurfaceState.LinkToScenarioSubmitted]:
      API_EVENT_KINDS.scenario__costSurface__link__submitted__v1_alpha1,
  };

  async event(
    scenarioId: string,
    state: ScenarioCostSurfaceState,
    context?: Record<string, unknown>,
  ): Promise<void> {
    await this.create({
      data: context ?? {},
      topic: scenarioId,
      kind: this.eventsMap[state],
    });
  }
}
