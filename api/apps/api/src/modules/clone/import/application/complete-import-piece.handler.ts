import {
  CommandHandler,
  EventBus,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/lib/Either';
import {
  componentAlreadyCompleted,
  componentNotFound,
  Import,
} from '../domain';
import { CompleteImportPiece } from './complete-import-piece.command';
import { ImportPieceFailed } from './import-piece-failed.event';
import { ImportRepository } from './import.repository.port';
import { Logger } from '@nestjs/common';

@CommandHandler(CompleteImportPiece)
export class CompleteImportPieceHandler
  implements IInferredCommandHandler<CompleteImportPiece> {
  constructor(
    private readonly importRepository: ImportRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(CompleteImportPieceHandler.name);
  }

  async execute({ importId, componentId }: CompleteImportPiece): Promise<void> {
    await this.importRepository
      .transaction(async (repo) => {
        const importInstance = await repo.find(importId);

        if (!importInstance) {
          throw new Error(
            `${CompleteImportPieceHandler.name} could not find import ${importId.value} to complete piece: ${componentId.value}`,
          );
        }

        const importAggregate = this.eventPublisher.mergeObjectContext(
          importInstance,
        );

        const result = importAggregate.completePiece(componentId);

        if (isLeft(result)) {
          switch (result.left) {
            case componentNotFound:
              throw new Error(
                `Could not find piece with ID: ${componentId} for import with ID: ${importId}`,
              );
            case componentAlreadyCompleted:
              this.logger.error(
                `Component with ${componentId} was already completed`,
              );
              return;
          }
        }

        await repo.save(importAggregate);

        importAggregate.commit();
      })
      .catch((err) => {
        this.logger.error(err);
        this.eventBus.publish(new ImportPieceFailed(importId, componentId));
      });
  }
}
