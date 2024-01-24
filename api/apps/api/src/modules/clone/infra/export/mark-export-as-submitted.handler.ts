import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { MarkExportAsSubmitted } from './mark-export-as-submitted.command';

@CommandHandler(MarkExportAsSubmitted)
export class MarkExportAsSubmittedHandler
  implements IInferredCommandHandler<MarkExportAsSubmitted>
{
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__submitted__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__submitted__v1__alpha,
  };

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    exportId,
    resourceId,
    resourceKind,
  }: MarkExportAsSubmitted): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId.value,
      data: {
        exportId: exportId.value,
        resourceId: resourceId.value,
        resourceKind,
      },
    });
  }
}
