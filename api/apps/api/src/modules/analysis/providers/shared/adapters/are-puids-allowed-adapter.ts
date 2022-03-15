import { Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { differenceWith } from 'lodash';
import { ArePuidsAllowedPort } from '../are-puids-allowed.port';

import { ScenariosPlanningUnitService } from '../../../../scenarios-planning-unit/scenarios-planning-unit.service';

@Injectable()
export class ArePuidsAllowedAdapter
  extends ScenariosPlanningUnitService
  implements ArePuidsAllowedPort
{
  async validate(
    scenarioId: string,
    puIds: string[],
  ): Promise<{ errors: unknown[] }> {
    const allowedFeaturesIds = (
      await this.findAll(
        {
          disablePagination: true,
        },
        {
          params: {
            scenarioId,
          },
        },
      )
    )[0]
      .map((scenarioPlanningUnit) => scenarioPlanningUnit.id)
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
