import { Injectable } from '@nestjs/common';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from '../../ports/cost-surface-events.port';

@Injectable()
export class CostSurfaceEventsFake implements CostSurfaceEventsPort {
  mock = jest.fn();
  events: [string, CostSurfaceState][] = [];

  async event(
    scenarioId: string,
    state: CostSurfaceState,
    context?: Record<string, unknown> | Error,
  ): Promise<void> {
    this.events.push([scenarioId, state]);
    return this.mock(scenarioId, state, context);
  }
}
