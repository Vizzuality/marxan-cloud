import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { MarkImportAsSubmitted } from './mark-import-as-submitted.command';

@CommandHandler(MarkImportAsSubmitted)
export class MarkImportAsSubmittedHandler
  implements IInferredCommandHandler<MarkImportAsSubmitted> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__submitted__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__submitted__v1__alpha,
  };

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    importId,
    resourceId,
    resourceKind,
  }: MarkImportAsSubmitted): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId.value,
      data: {
        importId: importId.value,
        resourceId: resourceId.value,
        resourceKind,
      },
    });
  }
}
