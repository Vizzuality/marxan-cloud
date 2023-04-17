import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { LegacyProjectImportJobInput } from '@marxan/legacy-project-import';
import { Inject, Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { isLeft } from 'fp-ts/lib/Either';
import { MarkLegacyProjectImportAsFailed } from '../application/mark-legacy-project-import-as-failed.command';
import { MarkLegacyProjectImportPieceAsFailed } from '../application/mark-legacy-project-import-piece-as-failed.command';
import { LegacyProjectImportComponentId } from '../domain/legacy-project-import/legacy-project-import-component.id';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { importLegacyProjectPieceQueueToken } from './legacy-project-import-queue.provider';
import { ScheduleLegacyProjectImportPiece } from './schedule-legacy-project-import-piece.command';

@CommandHandler(ScheduleLegacyProjectImportPiece)
export class ScheduleLegacyProjectImportPieceHandler
  implements IInferredCommandHandler<ScheduleLegacyProjectImportPiece> {
  private readonly logger: Logger = new Logger(
    ScheduleLegacyProjectImportPieceHandler.name,
  );

  constructor(
    private readonly apiEvents: ApiEventsService,
    @Inject(importLegacyProjectPieceQueueToken)
    private readonly queue: Queue<LegacyProjectImportJobInput>,
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    private readonly commandBus: CommandBus,
  ) {}

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
      const errorMsg = `Legacy project import with project ID ${projectId.value} not found`;
      this.logger.error(errorMsg);
      await this.commandBus.execute(
        new MarkLegacyProjectImportAsFailed(projectId, errorMsg),
      );
      return;
    }
    const legacyProjectImportInstance = legacyProjectImportOrError.right;

    const {
      pieces,
      files,
      scenarioId,
      ownerId,
    } = legacyProjectImportInstance.toSnapshot();

    const component = pieces.find((piece) => piece.id === componentId.value);
    if (!component) {
      const errorMsg = `Legacy project import component with ID ${componentId.value} not found`;
      this.logger.error(errorMsg);
      await this.commandBus.execute(
        new MarkLegacyProjectImportAsFailed(projectId, errorMsg),
      );
      return;
    }

    const { kind: piece, id: pieceId } = component;

    const job = await this.queue.add(`export-piece`, {
      files,
      projectId: projectId.value,
      scenarioId,
      piece,
      pieceId,
      ownerId,
    });

    if (!job) {
      const errorMsg = `[ScheduleLegacyProjectImportPieceHandler] Unable to start job - projectId=${projectId.value}`;
      this.logger.error(errorMsg);
      await this.commandBus.execute(
        new MarkLegacyProjectImportPieceAsFailed(
          projectId,
          new LegacyProjectImportComponentId(pieceId),
          [errorMsg],
        ),
      );
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
