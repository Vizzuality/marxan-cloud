import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ImportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { Inject } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ImportPieceFailed } from '../../import/application/import-piece-failed.event';
import { importPieceQueueToken } from './import-queue.provider';
import { SchedulePieceImport } from './schedule-piece-import.command';

@CommandHandler(SchedulePieceImport)
export class SchedulePieceImportHandler
  implements IInferredCommandHandler<SchedulePieceImport> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__piece__submitted__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__piece__submitted__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    @Inject(importPieceQueueToken)
    private readonly queue: Queue<ImportJobInput>,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    piece,
    importId,
    componentId,
    resourceId,
    resourceKind,
    uris,
  }: SchedulePieceImport): Promise<void> {
    const job = await this.queue.add(`import-piece`, {
      piece,
      importId: importId.value,
      componentId: componentId.value,
      resourceId: resourceId.value,
      resourceKind,
      uris,
    });

    if (!job) {
      this.eventBus.publish(
        new ImportPieceFailed(importId, componentId, resourceId, resourceKind),
      );
      return;
    }

    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: componentId.value,
      data: {
        piece,
        importId: importId.value,
        componentId: componentId.value,
        resourceId: resourceId.value,
      },
    });
  }
}
