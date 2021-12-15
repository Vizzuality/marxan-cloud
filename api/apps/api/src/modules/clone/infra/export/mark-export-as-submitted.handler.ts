import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { MarkExportAsSubmitted } from './mark-export-as-submitted.command';

@CommandHandler(MarkExportAsSubmitted)
export class MarkExportAsSubmittedHandler
  implements IInferredCommandHandler<MarkExportAsSubmitted> {
  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    exportId,
    resourceId,
    resourceKind,
  }: MarkExportAsSubmitted): Promise<void> {
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
    return Promise.resolve(undefined);
  }
}
