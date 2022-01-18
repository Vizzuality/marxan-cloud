import { JobInput } from '@marxan/cloning/job-input';
import { Inject } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Job, Queue } from 'bullmq';
import { CancelExportPendingJobs } from './cancel-export-pending-jobs.command';
import { exportPieceQueueToken } from './export-queue.provider';
import { exists } from '@marxan/utils/exists';

@CommandHandler(CancelExportPendingJobs)
export class CancelExportPendingJobsHandler
  implements IInferredCommandHandler<CancelExportPendingJobs> {
  constructor(
    @Inject(exportPieceQueueToken)
    private readonly queue: Queue<JobInput>,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ exportId }: CancelExportPendingJobs): Promise<void> {
    const pendingJobs: Job<JobInput>[] = await this.queue.getJobs([
      'waiting',
      'delayed',
    ]);

    const exportJobs = pendingJobs.filter(
      (job) => job.data.exportId === exportId.value,
    );

    await Promise.all(
      exportJobs
        .map((job) => job.id)
        .filter(exists)
        .map((id) => this.queue.remove(id)),
    );
  }
}
