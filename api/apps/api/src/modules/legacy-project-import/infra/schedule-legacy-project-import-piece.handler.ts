import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { LegacyProjectImportJobInput } from '@marxan/legacy-project-import';
import { Inject, Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { isLeft } from 'fp-ts/lib/Either';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { importLegacyProjectPieceQueueToken } from './legacy-project-import-queue.provider';
import { ScheduleLegacyProjectImportPiece } from './schedule-legacy-project-import-piece.command';

@CommandHandler(ScheduleLegacyProjectImportPiece)
export class ScheduleLegacyProjectImportPieceHandler
  implements IInferredCommandHandler<ScheduleLegacyProjectImportPiece> {
  constructor(
    private readonly apiEvents: ApiEventsService,
    @Inject(importLegacyProjectPieceQueueToken)
    private readonly queue: Queue<LegacyProjectImportJobInput>,
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScheduleLegacyProjectImportPieceHandler.name);
  }

  async execute({
    projectId,
    componentId,
  }: ScheduleLegacyProjectImportPiece): Promise<void> {
    const kind =
      API_EVENT_KINDS.project__legacy__import__piece__submitted__v1__alpha;

    const legacyProjectImportOrError = await this.legacyProjectImportRepository.find(
      projectId,
    );

    if (isLeft(legacyProjectImportOrError)) {
      this.logger.error(
        `Legacy project import with project ID ${projectId.value} not found`,
      );
      //this.eventBus.publish(new ExportPieceFailed(projectId, componentId));
      return;
    }
    const legacyProjectImportInstance = legacyProjectImportOrError.right;

    const {
      pieces,
      files,
      scenarioId,
    } = legacyProjectImportInstance.toSnapshot();

    const component = pieces.find((piece) => piece.id === componentId.value);
    if (!component) {
      this.logger.error(
        `Legacy project import component with ID ${componentId.value} not found`,
      );
      //this.eventBus.publish(new ExportPieceFailed(exportId, componentId));
      return;
    }

    const { kind: piece, id: pieceId } = component;

    const job = await this.queue.add(`export-piece`, {
      files,
      projectId: projectId.value,
      scenarioId,
      piece,
      pieceId,
    });

    if (!job) {
      this.logger.error(
        `[ScheduleLegacyProjectImportPieceHandler] Unable to start job - projectId=${projectId.value}`,
      );
      //this.eventBus.publish(new ExportPieceFailed(exportId, componentId));
      return;
    }

    await this.apiEvents.createIfNotExists({
      kind,
      topic: componentId.value,
      data: {
        piece,
        projectId: projectId.value,
        componentId: componentId.value,
      },
    });
  }
}
