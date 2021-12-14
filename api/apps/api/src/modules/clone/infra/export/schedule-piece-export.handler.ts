import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { JobInput } from '@marxan/cloning';
import { Queue } from 'bullmq';

import { SchedulePieceExport } from './schedule-piece-export.command';
import { exportPieceQueueToken } from './export-queue.provider';

@CommandHandler(SchedulePieceExport)
export class SchedulePieceExportHandler
  implements IInferredCommandHandler<SchedulePieceExport> {
  private readonly logger = new Logger(SchedulePieceExportHandler.name);

  constructor(
    @Inject(exportPieceQueueToken) private readonly queue: Queue<JobInput>,
  ) {}

  async execute({
    piece,
    exportId,
    componentId,
    resourceId,
  }: SchedulePieceExport): Promise<void> {
    const job = await this.queue.add(`export-piece`, {
      piece,
      exportId: exportId.value,
      componentId: componentId.value,
      resourceId: resourceId.value,
    });

    if (!job) {
      this.logger.error(
        `[SchedulePieceExportHandler] Unable to start job - exportId=${exportId.value}`,
      );
      return;
    }
  }
}
