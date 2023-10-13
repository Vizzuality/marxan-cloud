import { Injectable } from '@nestjs/common';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  UpdatePlanningUnitsEventsPort,
  UpdatePlanningUnitsState,
} from '../update-planning-units-events.port';

@Injectable()
export class UpdatePlanningUnitsApiEvents
  extends ApiEventsService
  implements UpdatePlanningUnitsEventsPort
{
  private readonly eventMap: Record<UpdatePlanningUnitsState, API_EVENT_KINDS> =
    {
      [UpdatePlanningUnitsState.Submitted]:
        API_EVENT_KINDS.scenario__planningUnitsInclusion__submitted__v1__alpha1,
      [UpdatePlanningUnitsState.Failed]:
        API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1,
    };

  async event(
    scenarioId: string,
    state: UpdatePlanningUnitsState,
    context?: Record<string, unknown> | Error,
  ) {
    await this.create({
      data: {
        context,
      },
      topic: scenarioId,
      kind: this.eventMap[state],
    });
  }
}
