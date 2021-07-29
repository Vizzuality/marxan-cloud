import { Injectable } from '@nestjs/common';
import { AdjustPlanningUnits } from '../../entry-points/adjust-planning-units';
import { AdjustPlanningUnitsInput } from '../../entry-points/adjust-planning-units-input';

import { ArePuidsAllowedPort } from '../shared/are-puids-allowed.port';
import { RequestJobPort } from './request-job.port';
import {
  UpdatePlanningUnitsEventsPort,
  UpdatePlanningUnitsState,
} from './update-planning-units-events.port';

@Injectable()
export class UpdatePlanningUnitsService implements AdjustPlanningUnits {
  constructor(
    private readonly puUuidValidator: ArePuidsAllowedPort,
    private readonly apiEvents: UpdatePlanningUnitsEventsPort,
    private readonly jobRequester: RequestJobPort,
  ) {}

  async update(
    scenarioId: string,
    constraints: AdjustPlanningUnitsInput,
  ): Promise<void> {
    await this.apiEvents.event(scenarioId, UpdatePlanningUnitsState.Submitted);
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
        await this.apiEvents.event(
          scenarioId,
          UpdatePlanningUnitsState.Failed,
          {
            errors,
          },
        );
        throw new Error(
          'One or more of the planning units provided for exclusion or inclusion does not match any planning unit of the present scenario.',
        );
      }
    }

    try {
      await this.jobRequester.queue({
        scenarioId,
        ...constraints,
      });
    } catch (error) {
      await this.apiEvents.event(
        scenarioId,
        UpdatePlanningUnitsState.Failed,
        error,
      );
    }

    return;
  }
}
