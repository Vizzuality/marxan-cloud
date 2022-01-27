import { ApiEventsService } from '@marxan-api/modules/api-events';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';

import { ResourceKind } from '@marxan/cloning/domain';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { MarkExportAsFinished } from './mark-export-as-finished.command';

@CommandHandler(MarkExportAsFinished)
export class MarkExportAsFinishedHandler
  implements IInferredCommandHandler<MarkExportAsFinished> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__finished__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__finished__v1__alpha,
  };

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    resourceKind,
    resourceId,
    exportId,
  }: MarkExportAsFinished): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId.value,
      data: {
        exportId,
        resourceId,
        resourceKind,
      },
    });
  }
}
