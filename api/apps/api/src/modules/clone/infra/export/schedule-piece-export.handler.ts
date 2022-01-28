import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { JobInput } from '@marxan/cloning';
import { Queue } from 'bullmq';

import { ApiEventsService } from '@marxan-api/modules/api-events';

import { SchedulePieceExport } from './schedule-piece-export.command';
import { exportPieceQueueToken } from './export-queue.provider';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ExportPieceFailed } from '../../export/application/export-piece-failed.event';
import { ResourceKind } from '@marxan/cloning/domain';

@CommandHandler(SchedulePieceExport)
export class SchedulePieceExportHandler
  implements IInferredCommandHandler<SchedulePieceExport> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__piece__submitted__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__piece__submitted__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    @Inject(exportPieceQueueToken) private readonly queue: Queue<JobInput>,
    private readonly eventBus: EventBus,
    private logger: Logger,
  ) {
    this.logger.setContext(SchedulePieceExportHandler.name);
  }

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
      this.eventBus.publish(
        new ExportPieceFailed(exportId, componentId, resourceId, resourceKind),
      );
      return;
    }

    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
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
