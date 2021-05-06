import { Injectable } from '@nestjs/common';
import { ArePuidsAllowedPort } from '../are-puids-allowed.port';
import { ScenariosPlanningUnitService } from '../../scenarios-planning-unit/scenarios-planning-unit.service';

@Injectable()
export class ArePuidsAllowedAdapter
  extends ScenariosPlanningUnitService
  implements ArePuidsAllowedPort {
  async validate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scenarioId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    puIds: string[],
  ): Promise<{ errors: unknown[] }> {
    // TODO real implementation in standalone PR, with e2e-integration test
    return Promise.resolve({ errors: [] });
  }
}
