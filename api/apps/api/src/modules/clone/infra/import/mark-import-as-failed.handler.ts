import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ApiEventByTopicAndKind } from '../../../api-events/api-event.topic+kind.api.entity';
import { ImportRepository } from '../../import/application/import.repository.port';
import { MarkImportAsFailed } from './mark-import-as-failed.command';

@CommandHandler(MarkImportAsFailed)
export class MarkImportAsFailedHandler
  implements IInferredCommandHandler<MarkImportAsFailed> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__failed__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__failed__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly importRepository: ImportRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MarkImportAsFailedHandler.name);
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

  async execute({ importId, reason }: MarkImportAsFailed): Promise<void> {
    const importInstance = await this.importRepository.find(importId);

    if (!importInstance) {
      this.logger.error(
        `Import with ID ${importId.value} not found. Import cannot be marked as failed`,
      );
      return;
    }
    const { resourceKind, resourceId, projectId } = importInstance.toSnapshot();
    const kind = this.eventMapper[resourceKind];

    const previousEvent = await this.findPreviousEvent(kind, resourceId);
    if (previousEvent) return;

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId,
      data: {
        importId: importId.value,
        resourceId,
        resourceKind,
        reason,
        projectId,
      },
    });
  }
}
