import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

import { calibrationQueueToken } from './blm-calibration-queue.providers';
import { JobData } from '@marxan/blm-calibration';
import { CancelBlmCalibration } from './cancel-blm-calibration.command';
import { ScenarioJobService } from '../scenario-job/scenario-job.service';

@CommandHandler(CancelBlmCalibration)
export class CancelBlmCalibrationHandler
  implements IInferredCommandHandler<CancelBlmCalibration> {
  constructor(
    @Inject(calibrationQueueToken)
    private readonly queue: Queue<JobData>,
    private readonly scenarioJobService: ScenarioJobService,
  ) {}

  async execute({ scenarioId }: CancelBlmCalibration): Promise<void> {
    const scenarioJob = await this.scenarioJobService.getScenarioJob(
      this.queue,
      scenarioId,
      ['active', 'waiting'],
    );

    if (!scenarioJob) {
      // Job may have ended or failed
      return;
    }

    await this.scenarioJobService.cancelScenarioJob(scenarioJob);
  }
}
