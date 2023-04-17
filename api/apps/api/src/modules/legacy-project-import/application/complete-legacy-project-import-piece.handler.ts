import { Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/lib/Either';
import { ResourceId } from '@marxan/cloning/domain';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { CompleteLegacyProjectImportPiece } from './complete-legacy-project-import-piece.command';
import { MarkLegacyProjectImportAsFailed } from './mark-legacy-project-import-as-failed.command';
import {
  legacyProjectImportComponentAlreadyCompleted,
  legacyProjectImportComponentNotFound,
} from '../domain/legacy-project-import/legacy-project-import';

@CommandHandler(CompleteLegacyProjectImportPiece)
export class CompleteLegacyProjectImportPieceHandler
  implements IInferredCommandHandler<CompleteLegacyProjectImportPiece> {
  private readonly logger: Logger = new Logger(
    CompleteLegacyProjectImportPieceHandler.name,
  );

  constructor(
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    private readonly commandBus: CommandBus,
    private readonly eventPublisher: EventPublisher,
  ) {}

  private async markLegacyProjectImportAsFailed(
    projectId: ResourceId,
    reason: string,
  ): Promise<void> {
    this.logger.error(reason);
    await this.commandBus.execute(
      new MarkLegacyProjectImportAsFailed(projectId, reason),
    );
  }

  async execute({
    projectId,
    legacyProjectImportComponentId,
    warnings,
  }: CompleteLegacyProjectImportPiece): Promise<void> {
    const aggregate = await this.legacyProjectImportRepository.transaction(
      async (repo) => {
        const legacyProjectImport = await repo.find(projectId);

        if (isLeft(legacyProjectImport)) {
          await this.markLegacyProjectImportAsFailed(
            projectId,
            `Could not find legacy project import with project id ${projectId} to complete piece: ${legacyProjectImportComponentId}`,
          );
          return;
        }

        const aggregate = this.eventPublisher.mergeObjectContext(
          legacyProjectImport.right,
        );

        const result = aggregate.completePiece(
          legacyProjectImportComponentId,
          warnings,
        );

        if (isLeft(result)) {
          switch (result.left) {
            case legacyProjectImportComponentNotFound:
              await this.markLegacyProjectImportAsFailed(
                projectId,
                `Could not find piece with ID: ${legacyProjectImportComponentId} for legacy project import with project ID: ${projectId}`,
              );
            case legacyProjectImportComponentAlreadyCompleted:
              this.logger.warn(
                `Component with id ${legacyProjectImportComponentId} was already completed`,
              );
            default:
              return;
          }
        }

        const saveResult = await repo.save(aggregate);
        if (isLeft(saveResult)) {
          await this.markLegacyProjectImportAsFailed(
            projectId,
            `Could not save legacy project import with project ID: ${projectId}`,
          );
          return;
        }

        return aggregate;
      },
    );

    if (aggregate) aggregate.commit();
  }
}
