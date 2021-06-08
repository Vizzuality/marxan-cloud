import { Injectable } from '@nestjs/common';
import { AdjustPlanningUnits } from '../../entry-points/adjust-planning-units';
import { AdjustPlanningUnitsInput } from '../../entry-points/adjust-planning-units-input';

import { ArePuidsAllowedPort } from '../shared/are-puids-allowed.port';
import { RequestJobPort } from './request-job.port';

@Injectable()
export class UpdatePlanningUnitsService implements AdjustPlanningUnits {
  constructor(
    private readonly puUuidValidator: ArePuidsAllowedPort,
    // TODO: ApiEvents Service wrapper - similar to one used in CostSurfaceFacade
    private readonly jobRequester: RequestJobPort,
  ) {}

  async update(
    scenarioId: string,
    constraints: AdjustPlanningUnitsInput,
  ): Promise<void> {
    // TODO: ApiEvents: submitted

    const targetPuIds = [
      ...(constraints.include?.pu ?? []),
      ...(constraints.exclude?.pu ?? []),
    ];
    if (targetPuIds.length > 0) {
      const { errors } = await this.puUuidValidator.validate(
        scenarioId,
        targetPuIds,
      );
      if (errors.length > 0) {
        // TODO: ApiEvents: failed - remove throw
        throw new Error(
          'One or more of the planning units provided for exclusion or inclusion does not match any planning unit of the present scenario.',
        );
      }
    }

    await this.jobRequester.queue({
      scenarioId,
      ...constraints,
    });

    // TODO: ApiEvents: failed - if adding to queue failed

    return;
  }
}
