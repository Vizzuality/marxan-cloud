import { Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { ResourceId } from '@marxan/cloning/domain';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { MarkLegacyProjectImportPieceAsFailed } from './mark-legacy-project-import-piece-as-failed.command';
import { MarkLegacyProjectImportAsFailed } from './mark-legacy-project-import-as-failed.command';
import {
  LegacyProjectImport,
  legacyProjectImportComponentAlreadyFailed,
  legacyProjectImportComponentNotFound,
} from '../domain/legacy-project-import/legacy-project-import';
import { isLeft } from 'fp-ts/lib/Either';

@CommandHandler(MarkLegacyProjectImportPieceAsFailed)
export class MarkLegacyProjectImportPieceAsFailedHandler
  implements IInferredCommandHandler<MarkLegacyProjectImportPieceAsFailed> {
  constructor(
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    private readonly commandBus: CommandBus,
    private readonly eventPublisher: EventPublisher,
    private readonly logger: Logger,
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
    errors,
    legacyProjectImportComponentId,
    projectId,
    warnings,
  }: MarkLegacyProjectImportPieceAsFailed): Promise<void> {
    const result = await this.legacyProjectImportRepository.transaction(
      async (repo) => {
        const legacyProjectImport = await repo.find(projectId);

        if (isLeft(legacyProjectImport)) {
          await this.markLegacyProjectImportAsFailed(
            projectId,
            `Could not find legacy project import with project ID ${projectId.value} to mark piece ${legacyProjectImportComponentId.value} as failed`,
          );
          return;
        }

        const aggregate = this.eventPublisher.mergeObjectContext(
          legacyProjectImport.right,
        );

        const result = aggregate.markPieceAsFailed(
          legacyProjectImportComponentId,
          errors,
          warnings,
        );

        if (isLeft(result)) {
          switch (result.left) {
            case legacyProjectImportComponentNotFound:
              await this.markLegacyProjectImportAsFailed(
                projectId,
                `Could not find piece with ID: ${legacyProjectImportComponentId.value} of legacy project import with project ID: ${projectId.value}`,
              );
              return;
            case legacyProjectImportComponentAlreadyFailed:
              this.logger.warn(
                `Component with id ${legacyProjectImportComponentId.value} was already marked as failed`,
              );
              return;
          }
        }

        const saveResult = await repo.save(aggregate);

        if (isLeft(saveResult)) {
          await this.markLegacyProjectImportAsFailed(
            projectId,
            `Could not save legacy project import with project ID: ${projectId.value}`,
          );
          return;
        }

        return aggregate;
      },
    );

    if (result instanceof LegacyProjectImport) {
      result.commit();
    }
  }
}
