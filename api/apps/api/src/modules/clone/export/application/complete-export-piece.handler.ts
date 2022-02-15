import { ExportPieceFailed } from '@marxan-api/modules/clone/export/application/export-piece-failed.event';
import { Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';
import { Export } from '../domain';
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
    let exportInstance: Export | undefined;
    await this.exportRepository
      .transaction(async (repo) => {
        exportInstance = await repo.find(exportId);

        if (!exportInstance) {
          const errorMessage = `${CompleteExportPieceHandler.name} could not find export ${exportId.value} to complete piece: ${componentId.value}`;
          this.logger.error(errorMessage);
          throw new Error(errorMessage);
        }

        const exportAggregate = this.eventPublisher.mergeObjectContext(
          exportInstance,
        );

        const result = exportAggregate.completeComponent(
          componentId,
          componentLocation,
        );
        if (isLeft(result)) {
          throw new Error(
            `Could not find piece with ID: ${componentId} for export with ID: ${exportId}`,
          );
        }

        await repo.save(exportAggregate);

        exportAggregate.commit();
      })
      .catch(() => {
        if (exportInstance) {
          this.eventBus.publish(
            new ExportPieceFailed(
              exportId,
              componentId,
              exportInstance.resourceId,
              exportInstance.resourceKind,
              componentLocation,
            ),
          );
        }
      });
  }
}
