import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

import { calibrationQueueToken } from './blm-calibration-queue.providers';
import { JobData } from '@marxan/blm-calibration';
import { CancelBlmCalibration } from './cancel-blm-calibration.command';

@CommandHandler(CancelBlmCalibration)
export class CancelBlmCalibrationHandler
  implements IInferredCommandHandler<CancelBlmCalibration> {
  constructor(
    @Inject(calibrationQueueToken)
    private readonly queue: Queue<JobData>,
  ) {}

  async execute({ scenarioId }: CancelBlmCalibration): Promise<void> {
    const activeJobs: Job<JobData>[] = await this.queue.getJobs([
      'active',
      'waiting',
    ]);
    const scenarioJob = activeJobs.find(
      (job) => job.data.scenarioId === scenarioId,
    );
    if (!scenarioJob) {
      // Job may have ended or failed
      return;
    }

    if (await scenarioJob.isActive())
      await scenarioJob.updateProgress({
        canceled: true,
        scenarioId,
      });
    else if (await scenarioJob.isWaiting()) await scenarioJob.remove();
  }
}
