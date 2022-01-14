import { JobInput } from '@marxan/cloning/job-input';
import { Inject } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Job, Queue } from 'bullmq';
import { CancelExportPendingJobs } from './cancel-export-pending-jobs.command';
import { exportPieceQueueToken } from './export-queue.provider';

@CommandHandler(CancelExportPendingJobs)
export class CancelExportPendingJobsHandler
  implements IInferredCommandHandler<CancelExportPendingJobs> {
  constructor(
    @Inject(exportPieceQueueToken)
    private readonly queue: Queue<JobInput>,
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
        .filter((job) => job.id)
        .map((job) => this.queue.remove(job.id!)),
    );
  }
}
