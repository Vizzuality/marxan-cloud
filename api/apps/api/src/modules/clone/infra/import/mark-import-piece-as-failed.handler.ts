import { Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/lib/Either';
import { ImportRepository } from '../../import/application/import.repository.port';
import { componentNotFound, ImportId } from '../../import/domain';
import { componentAlreadyFailed } from '../../import/domain/import/import';
import { MarkImportAsFailed } from './mark-import-as-failed.command';
import { MarkImportPieceAsFailed } from './mark-import-piece-as-failed.command';

@CommandHandler(MarkImportPieceAsFailed)
export class MarkImportPieceAsFailedHandler
  implements IInferredCommandHandler<MarkImportPieceAsFailed> {
  constructor(
    private readonly importRepository: ImportRepository,
    private readonly commandBus: CommandBus,
    private readonly eventPublisher: EventPublisher,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MarkImportPieceAsFailedHandler.name);
  }

  private async markImportAsFailed(
    importId: ImportId,
    reason: string,
  ): Promise<void> {
    this.logger.error(reason);
    await this.commandBus.execute(new MarkImportAsFailed(importId, reason));
  }

  async execute({
    importId,
    componentId,
  }: MarkImportPieceAsFailed): Promise<void> {
    const aggregate = await this.importRepository.transaction(async (repo) => {
      const importInstance = await repo.find(importId);

      if (!importInstance) {
        await this.markImportAsFailed(
          importId,
          `Could not find import ${importId.value} to mark piece ${componentId.value} as failed`,
        );
        return;
      }

      const importAggregate = this.eventPublisher.mergeObjectContext(
        importInstance,
      );

      const result = importAggregate.markPieceAsFailed(componentId);

      if (isLeft(result)) {
        switch (result.left) {
          case componentNotFound:
            await this.markImportAsFailed(
              importId,
              `Could not find piece with ID: ${componentId} for import with ID: ${importId}`,
            );
          case componentAlreadyFailed:
            this.logger.warn(
              `Component with id ${componentId} was already marked as failed`,
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
