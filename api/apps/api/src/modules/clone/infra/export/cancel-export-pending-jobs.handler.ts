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
import { exists } from '@marxan/utils/exists';
import { MarkExportPieceAsFailed } from '@marxan-api/modules/clone/infra/export/mark-export-piece-as-failed.command';
import { ComponentId, ResourceId } from '@marxan/cloning/domain';

@CommandHandler(CancelExportPendingJobs)
export class CancelExportPendingJobsHandler
  implements IInferredCommandHandler<CancelExportPendingJobs> {
  constructor(
    @Inject(exportPieceQueueToken)
    private readonly queue: Queue<JobInput>,
    private readonly commandBus: CommandBus,
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
        .filter((job) => exists(job.id))
        .flatMap((job) => {
          if (job.id) {
            return [
              this.commandBus.execute(
                new MarkExportPieceAsFailed(
                  exportId,
                  new ComponentId(job.data.componentId),
                  job.data.resourceKind,
                  new ResourceId(job.data.resourceId),
                ),
              ),
              this.queue.remove(job.id),
            ];
          }
        }),
    );
  }
}
