import { Injectable } from '@nestjs/common';
import {
  CostSurfaceEventsPort,
  CostSurfaceState,
} from '../cost-surface-events.port';

@Injectable()
export class CostSurfaceApiEvents implements CostSurfaceEventsPort {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async event(scenarioId: string, state: CostSurfaceState): Promise<void> {
    //
  }
}
