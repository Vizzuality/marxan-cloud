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
    let importInstance: Import | undefined;
    await this.importRepository
      .transaction(async (repo) => {
        importInstance = await repo.find(importId);

        if (!importInstance) {
          const errorMessage = `${CompleteImportPieceHandler.name} could not find import ${importId.value} to complete piece: ${componentId.value}`;
          this.logger.error(errorMessage);
          throw new Error(errorMessage);
        }

        const importAggregate = this.eventPublisher.mergeObjectContext(
          importInstance,
        );

        const result = importAggregate.completePiece(componentId);

        if (isLeft(result)) {
          switch (result.left) {
            case componentNotFound:
              const errorMessage = `Could not find piece with ID: ${componentId} for import with ID: ${importId}`;
              this.logger.error(errorMessage);
              throw new Error(errorMessage);
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
      .catch(() => {
        if (importInstance) {
          this.eventBus.publish(new ImportPieceFailed(importId, componentId));
        }
      });
  }
}
