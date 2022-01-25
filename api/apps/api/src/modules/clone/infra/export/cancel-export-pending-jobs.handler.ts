import { JobInput } from '@marxan/cloning/job-input';
import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Job, Queue } from 'bullmq';
import { CancelExportPendingJobs } from './cancel-export-pending-jobs.command';
import { exportPieceQueueToken } from './export-queue.provider';
import { ComponentId } from '@marxan/cloning/domain';
import { MarkExportPiecesAsFailed } from '@marxan-api/modules/clone/infra/export/mark-export-pieces-as-failed.command';

@CommandHandler(CancelExportPendingJobs)
export class CancelExportPendingJobsHandler
  implements IInferredCommandHandler<CancelExportPendingJobs> {
  constructor(
    @Inject(exportPieceQueueToken)
    private readonly queue: Queue<JobInput>,
    private readonly commandBus: CommandBus,
  ) {}

  async execute({
    exportId,
    resourceKind,
    resourceId,
  }: CancelExportPendingJobs): Promise<void> {
    const pendingJobs: Job<JobInput>[] = await this.queue.getJobs([
      'waiting',
      'delayed',
    ]);

    const exportJobs = pendingJobs.filter(
      (job) => job.data.exportId === exportId.value,
    );

    if (exportJobs.length === 0) return;

    await Promise.all(
      exportJobs.map((job) => {
        if (!job.id) {
          return;
        }

        return this.queue.remove(job.id);
      }),
    );

    await this.commandBus.execute(
      new MarkExportPiecesAsFailed(
        exportId,
        resourceId,
        resourceKind,
        exportJobs.map((job) => new ComponentId(job.data.componentId)),
      ),
    );
  }
}
