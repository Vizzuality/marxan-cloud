import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ConsoleLogger, NotFoundException } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { isRight } from 'fp-ts/lib/Either';
import { ApiEventByTopicAndKind } from '../../api-events/api-event.topic+kind.api.entity';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { MarkLegacyProjectImportAsFailed } from './mark-legacy-project-import-as-failed.command';

@CommandHandler(MarkLegacyProjectImportAsFailed)
export class MarkLegacyProjectImportAsFailedHandler
  implements IInferredCommandHandler<MarkLegacyProjectImportAsFailed> {
  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(MarkLegacyProjectImportAsFailedHandler.name);
  }

  async findPreviousEvent(
    kind: API_EVENT_KINDS,
    topic: string,
  ): Promise<ApiEventByTopicAndKind | undefined> {
    try {
      const previousEvent = await this.apiEvents.getLatestEventForTopic({
        kind,
        topic,
      });

      return previousEvent;
    } catch (err) {
      if (err instanceof NotFoundException) {
        return undefined;
      }
      throw err;
    }
  }

  async execute({
    projectId,
    reason,
  }: MarkLegacyProjectImportAsFailed): Promise<void> {
    const legacyProjectImport = await this.legacyProjectImportRepository.find(
      projectId,
    );

    let ownerId: string | undefined;
    let scenarioId: string | undefined;

    if (isRight(legacyProjectImport)) {
      const snapshot = legacyProjectImport.right.toSnapshot();
      ownerId = snapshot.ownerId;
      scenarioId = snapshot.scenarioId;
    }
    const kind = API_EVENT_KINDS.project__legacy__import__failed__v1__alpha;
    const topic = projectId.value;

    const previousEvent = await this.findPreviousEvent(kind, topic);
    if (previousEvent) return;

    await this.apiEvents.createIfNotExists({
      kind,
      topic,
      data: {
        projectId: topic,
        scenarioId,
        ownerId,
        reason,
      },
    });
  }
}
