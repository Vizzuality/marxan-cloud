import { Injectable } from '@nestjs/common';
import {
  UpdatePlanningUnitsEventsPort,
  UpdatePlanningUnitsState,
} from '../update-planning-units-events.port';

@Injectable()
export class ApiEventsMock implements UpdatePlanningUnitsEventsPort {
  eventMock = jest.fn();

  event(
    scenarioId: string,
    state: UpdatePlanningUnitsState,
    context?: Record<string, unknown> | Error,
  ): Promise<void> {
    return this.eventMock(scenarioId, state, context);
  }
}
