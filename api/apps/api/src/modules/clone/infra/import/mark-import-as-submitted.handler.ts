import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { ConsoleLogger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ImportRepository } from '../../import/application/import.repository.port';
import { MarkImportAsSubmitted } from './mark-import-as-submitted.command';

@CommandHandler(MarkImportAsSubmitted)
export class MarkImportAsSubmittedHandler
  implements IInferredCommandHandler<MarkImportAsSubmitted>
{
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__submitted__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__submitted__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly importRepository: ImportRepository,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(MarkImportAsSubmittedHandler.name);
  }

  async execute({ importId }: MarkImportAsSubmitted): Promise<void> {
    const importInstance = await this.importRepository.find(importId);

    if (!importInstance) {
      this.logger.error(`Import with ID ${importId.value} not found`);
      return;
    }
    const { resourceKind, resourceId } = importInstance.toSnapshot();

    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId,
      data: {
        importId: importId.value,
        resourceId,
        resourceKind,
      },
    });
  }
}
