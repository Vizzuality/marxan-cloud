import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { JobData as RunJobData } from '@marxan/scenario-run-queue';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { assertDefined } from '@marxan/utils';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { Scenario } from '../scenario.api.entity';
import {
  blmDefaultToken,
  calibrationQueueToken,
  runQueueToken,
} from './tokens';
import { AssetsService } from './assets.service';
import { JobData as CalibrationJobData } from '@marxan/blm-calibration';

@Injectable()
export class RunHandler {
  readonly #logger = new Logger(this.constructor.name);

  constructor(
    @Inject(runQueueToken)
    private readonly runQueue: Queue<RunJobData>,
    @Inject(calibrationQueueToken)
    private readonly calibrationQueue: Queue<CalibrationJobData>,
    private readonly apiEvents: ApiEventsService,
    @InjectRepository(Scenario)
    private readonly scenarios: Repository<Scenario>,
    private readonly assets: AssetsService,
    @Inject(blmDefaultToken)
    private readonly blmDefault: number,
  ) {}

  async runCalibration(scenarioId: string, blmValues: number[]) {
    // In order to ensure that boundary data is included in assets array
    // a non zero value should be provided to `forScenario` method of AssetsService
    const nonZeroBLMValue = 1;

    const assets = await this.assets.forScenario(scenarioId, nonZeroBLMValue);
    assertDefined(assets);
    const job = await this.calibrationQueue.add(`calibrate-scenario`, {
      scenarioId,
      assets,
      blmValues,
    });

    if (!job) {
      this.#logger.error(
        `Unable to start job CalibrateScenarioJob - adding job failed.`,
      );
      return;
    }

    const kind = API_EVENT_KINDS.scenario__calibration__submitted_v1_alpha1;
    await this.apiEvents.create({
      topic: scenarioId,
      kind,
      externalId: job.id + kind,
    });
  }

  async run(
    scenario: {
      id: string;
      boundaryLengthModifier?: number;
    },
    overridingBlm?: number,
  ): Promise<void> {
    const blm =
      overridingBlm ?? scenario.boundaryLengthModifier ?? this.blmDefault;
    const assets = await this.assets.forScenario(scenario.id, blm);
    assertDefined(assets);
    const job = await this.runQueue.add(`run-scenario`, {
      scenarioId: scenario.id,
      assets,
    });
    await this.scenarios.update(scenario.id, {
      ranAtLeastOnce: true,
    });
    const kind = API_EVENT_KINDS.scenario__run__submitted__v1__alpha1;
    await this.apiEvents.create({
      topic: scenario.id,
      kind,
      externalId: job.id + kind,
    });
  }
}
