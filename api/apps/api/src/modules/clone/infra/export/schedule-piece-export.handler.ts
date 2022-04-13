import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { Inject, Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ExportPieceFailed } from '../../export/application/export-piece-failed.event';
import { ExportRepository } from '../../export/application/export-repository.port';
import { exportPieceQueueToken } from './export-queue.provider';
import { SchedulePieceExport } from './schedule-piece-export.command';

@CommandHandler(SchedulePieceExport)
export class SchedulePieceExportHandler
  implements IInferredCommandHandler<SchedulePieceExport> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__piece__submitted__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__piece__submitted__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    @Inject(exportPieceQueueToken)
    private readonly queue: Queue<ExportJobInput>,
    private readonly eventBus: EventBus,
    private readonly exportRepository: ExportRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SchedulePieceExportHandler.name);
  }

  async execute({ exportId, componentId }: SchedulePieceExport): Promise<void> {
    const exportInstance = await this.exportRepository.find(exportId);

    if (!exportInstance) {
      this.logger.error(`Export with ID ${exportId.value} not found`);
      this.eventBus.publish(new ExportPieceFailed(exportId, componentId));
      return;
    }
    const {
      resourceKind,
      exportPieces,
      importResourceId,
    } = exportInstance.toSnapshot();

    const component = exportPieces.find(
      (piece) => piece.id === componentId.value,
    );
    if (!component) {
      this.logger.error(
        `Export component with ID ${componentId.value} not found`,
      );
      this.eventBus.publish(new ExportPieceFailed(exportId, componentId));
      return;
    }

    const { piece, resourceId } = component;
    const allPieces = exportPieces.map(({ piece, resourceId }) => ({
      piece,
      resourceId,
    }));

    const job = await this.queue.add(`export-piece`, {
      piece,
      exportId: exportId.value,
      componentId: componentId.value,
      resourceId,
      resourceKind,
      allPieces,
      isCloning: Boolean(importResourceId),
    });

    if (!job) {
      this.logger.error(
        `[SchedulePieceExportHandler] Unable to start job - exportId=${exportId.value}`,
      );
      this.eventBus.publish(new ExportPieceFailed(exportId, componentId));
      return;
    }

    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: componentId.value,
      data: {
        piece,
        exportId: exportId.value,
        componentId: componentId.value,
        resourceId,
      },
    });
  }
}
