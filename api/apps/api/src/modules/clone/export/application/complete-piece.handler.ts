import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { CompletePiece } from './complete-piece.command';
import { ExportRepository } from './export-repository.port';

@CommandHandler(CompletePiece)
export class CompletePieceHandler
  implements IInferredCommandHandler<CompletePiece> {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    exportId,
    componentLocation,
    componentId,
  }: CompletePiece): Promise<void> {
    await this.exportRepository.transaction(async (repo) => {
      const exportInstance = await repo.find(exportId);

      if (!exportInstance) {
        this.logger.error(
          `${CompletePieceHandler.name} could not find export ${exportId.value} to complete piece: ${componentId.value}`,
        );
        // TODO: could emit event as compensation action to remove the artifact
        return;
      }

      const exportAggregate = this.eventPublisher.mergeObjectContext(
        exportInstance,
      );

      exportAggregate.completeComponent(componentId, componentLocation);

      await repo.save(exportAggregate);
      exportAggregate.commit();
    });
  }
}
