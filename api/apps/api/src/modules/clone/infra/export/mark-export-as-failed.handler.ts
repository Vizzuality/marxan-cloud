import { ApiEventsService } from '@marxan-api/modules/api-events';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';

import { ResourceKind } from '@marxan/cloning/domain';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { MarkExportAsFailed } from './mark-export-as-failed.command';

@CommandHandler(MarkExportAsFailed)
export class MarkExportAsFailedHandler
  implements IInferredCommandHandler<MarkExportAsFailed> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__failed__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__failed__v1__alpha,
  };

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    resourceKind,
    resourceId,
    exportId,
  }: MarkExportAsFailed): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId.value,
      externalId: ApiEventsService.composeExternalId(exportId.value, kind),
      data: {
        exportId,
        resourceId,
        resourceKind,
      },
    });
  }
}
