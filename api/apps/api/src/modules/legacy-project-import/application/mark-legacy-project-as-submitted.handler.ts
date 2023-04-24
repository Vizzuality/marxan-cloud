import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceId } from '@marxan/cloning/domain';
import { Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/lib/Either';
import { ApiEventsService } from '../../api-events';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { MarkLegacyProjectImportAsSubmitted } from './mark-legacy-project-as-submitted.command';
import { MarkLegacyProjectImportAsFailed } from './mark-legacy-project-import-as-failed.command';

@CommandHandler(MarkLegacyProjectImportAsSubmitted)
export class MarkLegacyProjectImportAsSubmittedHandler
  implements IInferredCommandHandler<MarkLegacyProjectImportAsSubmitted> {
  private readonly logger: Logger = new Logger(
    MarkLegacyProjectImportAsSubmittedHandler.name,
  );

  constructor(
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    private readonly apiEvents: ApiEventsService,
    private readonly commandBus: CommandBus,
  ) {}

  private async markLegacyProjectImportAsSubmitted(
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
  }: MarkLegacyProjectImportAsSubmitted): Promise<void> {
    const legacyProjectImportOrError = await this.legacyProjectImportRepository.find(
      projectId,
    );

    if (isLeft(legacyProjectImportOrError)) {
      await this.markLegacyProjectImportAsSubmitted(
        projectId,
        `Could not find legacy project import with project ID ${projectId.value}`,
      );
      return;
    }

    const {
      ownerId,
      scenarioId,
    } = legacyProjectImportOrError.right.toSnapshot();
    const kind = API_EVENT_KINDS.project__legacy__import__submitted__v1__alpha;
    const topic = projectId.value;

    await this.apiEvents.createIfNotExists({
      kind,
      topic,
      data: {
        projectId: topic,
        ownerId,
        scenarioId,
      },
    });
  }
}
