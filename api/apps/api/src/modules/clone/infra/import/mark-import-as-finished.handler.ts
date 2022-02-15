import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { MarkImportAsFinished } from './mark-import-as-finished.command';

@CommandHandler(MarkImportAsFinished)
export class MarkImportAsFinishedHandler
  implements IInferredCommandHandler<MarkImportAsFinished> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__finished__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__finished__v1__alpha,
  };

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    resourceKind,
    resourceId,
    importId,
  }: MarkImportAsFinished): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId.value,
      data: {
        exportId: importId.value,
        resourceId: resourceId.value,
        resourceKind,
      },
    });
  }
}
