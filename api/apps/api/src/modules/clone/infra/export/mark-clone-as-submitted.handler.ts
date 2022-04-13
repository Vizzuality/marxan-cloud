import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { MarkCloneAsSubmitted } from './mark-clone-as-submitted.command';

@CommandHandler(MarkCloneAsSubmitted)
export class MarkCloneAsSubmittedHandler
  implements IInferredCommandHandler<MarkCloneAsSubmitted> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__clone__submitted__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__clone__submitted__v1__alpha,
  };

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    importResourceId,
    resourceKind,
  }: MarkCloneAsSubmitted): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: importResourceId.value,
      data: {
        resourceId: importResourceId.value,
        resourceKind,
      },
    });
  }
}
