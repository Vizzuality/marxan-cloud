import { ExportPieceFailed } from '@marxan-api/modules/clone/export/application/export-piece-failed.event';
import { Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';
import { pieceAlreadyExported, pieceNotFound } from '../domain/export/export';
import { CompleteExportPiece } from './complete-export-piece.command';
import { ExportRepository } from './export-repository.port';

@CommandHandler(CompleteExportPiece)
export class CompleteExportPieceHandler
  implements IInferredCommandHandler<CompleteExportPiece> {
  constructor(
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(CompleteExportPieceHandler.name);
  }

  async execute({
    exportId,
    componentLocation,
    componentId,
  }: CompleteExportPiece): Promise<void> {
    const aggregate = await this.exportRepository
      .transaction(async (repo) => {
        const exportInstance = await repo.find(exportId);

        if (!exportInstance) {
          throw new Error(
            `${CompleteExportPieceHandler.name} could not find export ${exportId.value} to complete piece: ${componentId.value}`,
          );
        }

        const exportAggregate = this.eventPublisher.mergeObjectContext(
          exportInstance,
        );

        const result = exportAggregate.completeComponent(
          componentId,
          componentLocation,
        );
        if (isLeft(result)) {
          switch (result.left) {
            case pieceNotFound:
              throw new Error(
                `Could not find piece with ID: ${componentId} for export with ID: ${exportId}`,
              );
            case pieceAlreadyExported:
              this.logger.error(
                `Component with id ${componentId} was already completed`,
              );
              return;
          }
        }

        await repo.save(exportAggregate);

        return exportAggregate;
      })
      .catch((err) => {
        this.logger.error(err);
        this.eventBus.publish(new ExportPieceFailed(exportId, componentId));
      });

    if (aggregate) aggregate.commit();
  }
}
