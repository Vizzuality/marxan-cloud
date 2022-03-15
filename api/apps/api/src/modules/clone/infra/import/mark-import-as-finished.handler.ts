import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { ConsoleLogger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ImportRepository } from '../../import/application/import.repository.port';
import { MarkImportAsFinished } from './mark-import-as-finished.command';

@CommandHandler(MarkImportAsFinished)
export class MarkImportAsFinishedHandler
  implements IInferredCommandHandler<MarkImportAsFinished>
{
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__finished__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__finished__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly importRepository: ImportRepository,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(MarkImportAsFinishedHandler.name);
  }

  async execute({ importId }: MarkImportAsFinished): Promise<void> {
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
        exportId: importId.value,
        resourceId,
        resourceKind,
      },
    });
  }
}
