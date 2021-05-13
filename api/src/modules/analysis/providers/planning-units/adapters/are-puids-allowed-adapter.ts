import { Injectable } from '@nestjs/common';
import { differenceWith } from 'lodash';
import { ArePuidsAllowedPort } from '../are-puids-allowed.port';

import { ScenariosPlanningUnitService } from '../../../../scenarios-planning-unit/scenarios-planning-unit.service';
import { isDefined } from '../../../../../utils/is-defined';

@Injectable()
export class ArePuidsAllowedAdapter
  extends ScenariosPlanningUnitService
  implements ArePuidsAllowedPort {
  async validate(
    scenarioId: string,
    puIds: string[],
  ): Promise<{ errors: unknown[] }> {
    const allowedFeaturesIds = (
      await this.findAll(undefined, {
        params: {
          scenarioId,
        },
      })
    )[0]
      .map((scenario) => scenario.puGeometryId)
      .filter(isDefined);

    /**
     * find those that are present in puIds but not in allowedFeaturesIds
     */
    const diff = differenceWith(puIds, allowedFeaturesIds);
    return {
      errors: diff.map((missingId) => `Missing ${missingId}`),
    };
  }
}
