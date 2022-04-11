import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ImportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { Inject, Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ImportRepository } from '../../import/application/import.repository.port';
import { ImportId } from '../../import/domain';
import { importPieceQueueToken } from './import-queue.provider';
import { MarkImportAsFailed } from './mark-import-as-failed.command';
import { MarkImportPieceAsFailed } from './mark-import-piece-as-failed.command';
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
    private readonly commandBus: CommandBus,
    private readonly importRepository: ImportRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SchedulePieceImportHandler.name);
  }

  private markImportAsFailed(importId: ImportId, reason: string): void {
    this.logger.error(reason);
    this.commandBus.execute(new MarkImportAsFailed(importId, reason));
  }

  async execute({ importId, componentId }: SchedulePieceImport): Promise<void> {
    const importInstance = await this.importRepository.find(importId);

    if (!importInstance) {
      this.markImportAsFailed(
        importId,
        `Import with ID ${importId.value} not found`,
      );
      return;
    }
    const {
      resourceKind,
      projectId,
      importPieces,
      ownerId,
    } = importInstance.toSnapshot();

    const component = importPieces.find(
      (piece) => piece.id === componentId.value,
    );
    if (!component) {
      this.markImportAsFailed(
        importId,
        `Import component with ID ${componentId.value} not found`,
      );
      return;
    }
    const { piece, uris, resourceId } = component;

    const job = await this.queue.add(`import-piece`, {
      piece,
      importId: importId.value,
      componentId: componentId.value,
      pieceResourceId: resourceId,
      projectId,
      ownerId,
      resourceKind,
      uris,
    });

    if (!job) {
      this.logger.error(`import-piece job couldn't be added to queue`);
      await this.commandBus.execute(
        new MarkImportPieceAsFailed(importId, componentId),
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
        resourceId,
        projectId,
      },
    });
  }
}
