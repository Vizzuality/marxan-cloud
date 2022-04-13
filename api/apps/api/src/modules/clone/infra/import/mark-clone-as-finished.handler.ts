import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { MarkCloneAsFinished } from './mark-clone-as-finished.command';

@CommandHandler(MarkCloneAsFinished)
export class MarkCloneAsFinishedHandler
  implements IInferredCommandHandler<MarkCloneAsFinished> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__clone__finished__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__clone__finished__v1__alpha,
  };

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    resourceId,
    resourceKind,
  }: MarkCloneAsFinished): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId.value,
      data: {
        resourceId: resourceId.value,
        resourceKind,
      },
    });
  }
}
