import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { JobInput } from '@marxan/cloning';
import { Queue } from 'bullmq';

import { ApiEventsService } from '@marxan-api/modules/api-events';

import { SchedulePieceExport } from './schedule-piece-export.command';
import { exportPieceQueueToken } from './export-queue.provider';
import { API_EVENT_KINDS } from '@marxan/api-events';

@CommandHandler(SchedulePieceExport)
export class SchedulePieceExportHandler
  implements IInferredCommandHandler<SchedulePieceExport> {
  private readonly logger = new Logger(SchedulePieceExportHandler.name);

  constructor(
    private readonly apiEvents: ApiEventsService,
    @Inject(exportPieceQueueToken) private readonly queue: Queue<JobInput>,
  ) {}

  async execute({
    piece,
    exportId,
    componentId,
    resourceId,
    resourceKind,
    allPieces,
  }: SchedulePieceExport): Promise<void> {
    const job = await this.queue.add(`export-piece`, {
      piece,
      exportId: exportId.value,
      componentId: componentId.value,
      resourceId: resourceId.value,
      resourceKind,
      allPieces,
    });

    if (!job) {
      this.logger.error(
        `[SchedulePieceExportHandler] Unable to start job - exportId=${exportId.value}`,
      );
      return;
    }

    await this.apiEvents.createIfNotExists({
      kind: API_EVENT_KINDS.project__export__piece__submitted__v1__alpha,
      topic: componentId.value,
      data: {
        piece,
        exportId,
        componentId,
        resourceId,
      },
    });
  }
}
