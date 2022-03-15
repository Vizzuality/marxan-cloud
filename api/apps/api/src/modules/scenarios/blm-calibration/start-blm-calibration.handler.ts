import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { StartBlmCalibration } from './start-blm-calibration.command';
import { calibrationQueueToken } from './blm-calibration-queue.providers';
import { JobData } from '@marxan/blm-calibration';
import { AssetsService } from '../marxan-run/assets.service';

@CommandHandler(StartBlmCalibration)
export class StartBlmCalibrationHandler
  implements IInferredCommandHandler<StartBlmCalibration>
{
  readonly #logger = new Logger(this.constructor.name);

  constructor(
    @Inject(calibrationQueueToken)
    private readonly queue: Queue<JobData>,
    private readonly apiEvents: ApiEventsService,
    private readonly assets: AssetsService,
  ) {}

  async execute({ scenarioId, blmValues }: StartBlmCalibration): Promise<void> {
    // In order to ensure that boundary data is included in assets array
    // a non zero value should be provided to `forScenario` method of AssetsService
    const nonZeroBLMValue = 1;
    const assets = await this.assets.forScenario(scenarioId, nonZeroBLMValue);

    const job = await this.queue.add(`calibrate-scenario`, {
      scenarioId,
      blmValues,
      assets,
    });

    if (!job) {
      this.#logger.error(
        `Unable to start job CalibrateScenarioJob - adding job failed.`,
      );
      return;
    }

    const kind = API_EVENT_KINDS.scenario__calibration__submitted_v1_alpha1;

    await this.apiEvents.create({
      kind,
      topic: scenarioId,
      externalId: job.id + kind,
      data: {
        blmValues,
      },
    });
  }
}
