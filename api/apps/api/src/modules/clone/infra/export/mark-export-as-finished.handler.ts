import { ApiEventsService } from '@marxan-api/modules/api-events';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';

import { ResourceKind } from '@marxan/cloning/domain';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { MarkExportAsFinished } from './mark-export-as-finished.command';

@CommandHandler(MarkExportAsFinished)
export class MarkExportAsFinishedHandler
  implements IInferredCommandHandler<MarkExportAsFinished> {
  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    resourceKind,
    resourceId,
    exportId,
  }: MarkExportAsFinished): Promise<void> {
    const kind =
      resourceKind === ResourceKind.Project
        ? API_EVENT_KINDS.project__export__submitted__v1__alpha
        : null;

    if (!kind) {
      // TODO update with Scenario once supported.
      return;
    }

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
