import { Injectable } from '@nestjs/common';
import { AdjustPlanningUnits } from '../../entry-points/adjust-planning-units';
import { AdjustPlanningUnitsInput } from '../../entry-points/adjust-planning-units-input';

import { ArePuidsAllowedPort } from '../shared/are-puids-allowed.port';
import { RequestJobPort } from './request-job.port';

type Success = true;

@Injectable()
export class UpdatePlanningUnitsService implements AdjustPlanningUnits {
  constructor(
    private readonly puUuidValidator: ArePuidsAllowedPort,
    private readonly jobRequester: RequestJobPort,
  ) {}

  async update(
    scenarioId: string,
    constraints: AdjustPlanningUnitsInput,
  ): Promise<Success> {
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
        throw new Error(
          'One or more of the planning units provided for exclusion or inclusion does not match any planning unit of the present scenario.',
        );
      }
    }

    await this.jobRequester.queue({
      scenarioId,
      ...constraints,
    });

    return true;
  }
}
