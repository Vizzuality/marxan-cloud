import { Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/lib/Either';
import { MarkImportAsFailed } from '../../infra/import/mark-import-as-failed.command';
import {
  componentAlreadyCompleted,
  componentNotFound,
  ImportId,
} from '../domain';
import { CompleteImportPiece } from './complete-import-piece.command';
import { ImportRepository } from './import.repository.port';

@CommandHandler(CompleteImportPiece)
export class CompleteImportPieceHandler
  implements IInferredCommandHandler<CompleteImportPiece> {
  constructor(
    private readonly importRepository: ImportRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly commandBus: CommandBus,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(CompleteImportPieceHandler.name);
  }

  private async markImportAsFailed(
    importId: ImportId,
    reason: string,
  ): Promise<void> {
    this.logger.error(reason);
    await this.commandBus.execute(new MarkImportAsFailed(importId, reason));
  }

  async execute({ importId, componentId }: CompleteImportPiece): Promise<void> {
    const aggregate = await this.importRepository.transaction(async (repo) => {
      const importInstance = await repo.find(importId);

      if (!importInstance) {
        await this.markImportAsFailed(
          importId,
          `Could not find import ${importId.value} to complete piece: ${componentId.value}`,
        );
        return;
      }

      const importAggregate = this.eventPublisher.mergeObjectContext(
        importInstance,
      );

      const result = importAggregate.completePiece(componentId);

      if (isLeft(result)) {
        switch (result.left) {
          case componentNotFound:
            await this.markImportAsFailed(
              importId,
              `Could not find piece with ID: ${componentId} for import with ID: ${importId}`,
            );
          case componentAlreadyCompleted:
            this.logger.warn(
              `Component with id ${componentId} was already completed`,
            );
          default:
            return;
        }
      }

      const saveResult = await repo.save(importAggregate);
      if (isLeft(saveResult)) {
        await this.markImportAsFailed(
          importId,
          `Could not save import with ID: ${importId}`,
        );
        return;
      }

      return importAggregate;
    });

    if (aggregate) aggregate.commit();
  }
}
