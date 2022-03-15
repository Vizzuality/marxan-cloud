import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ImportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { Inject, Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ImportPieceFailed } from '../../import/application/import-piece-failed.event';
import { ImportRepository } from '../../import/application/import.repository.port';
import { importPieceQueueToken } from './import-queue.provider';
import { SchedulePieceImport } from './schedule-piece-import.command';

@CommandHandler(SchedulePieceImport)
export class SchedulePieceImportHandler
  implements IInferredCommandHandler<SchedulePieceImport>
{
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__piece__submitted__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__piece__submitted__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    @Inject(importPieceQueueToken)
    private readonly queue: Queue<ImportJobInput>,
    private readonly eventBus: EventBus,
    private readonly importRepository: ImportRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SchedulePieceImportHandler.name);
  }

  async execute({ importId, componentId }: SchedulePieceImport): Promise<void> {
    const importInstance = await this.importRepository.find(importId);

    if (!importInstance) {
      this.logger.error(`Import with ID ${importId.value} not found`);
      this.eventBus.publish(new ImportPieceFailed(importId, componentId));
      return;
    }
    const {
      resourceKind,
      resourceId: importResourceId,
      importPieces,
    } = importInstance.toSnapshot();

    const component = importPieces.find(
      (piece) => piece.id === componentId.value,
    );
    if (!component) {
      this.logger.error(
        `Import component with ID ${componentId.value} not found`,
      );
      this.eventBus.publish(new ImportPieceFailed(importId, componentId));
      return;
    }
    const { piece, uris, resourceId: componentResourceId } = component;

    const job = await this.queue.add(`import-piece`, {
      piece,
      importId: importId.value,
      componentId: componentId.value,
      importResourceId,
      componentResourceId,
      resourceKind,
      uris,
    });

    if (!job) {
      this.logger.error(`import-piece job couldn't be added to queue`);
      this.eventBus.publish(new ImportPieceFailed(importId, componentId));
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
        importResourceId,
        componentResourceId,
      },
    });
  }
}
