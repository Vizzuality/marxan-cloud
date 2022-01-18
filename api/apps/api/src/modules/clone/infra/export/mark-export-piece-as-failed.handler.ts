import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { MarkExportPieceAsFailed } from '@marxan-api/modules/clone/infra/export/mark-export-piece-as-failed.command';

@CommandHandler(MarkExportPieceAsFailed)
export class MarkExportPieceAsFailedHandler
  implements IInferredCommandHandler<MarkExportPieceAsFailed> {
  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    exportId,
    resourceId,
    resourceKind,
    componentId,
  }: MarkExportPieceAsFailed): Promise<void> {
    const kind =
      resourceKind === ResourceKind.Project
        ? API_EVENT_KINDS.project__export__piece__failed__v1__alpha
        : null;

    if (!kind) {
      // TODO update with Scenario once supported.
      return;
    }

    await this.apiEvents.createIfNotExists({
      externalId: kind + componentId.value,
      kind,
      topic: resourceId.value,
      data: {
        exportId,
        resourceId,
        resourceKind,
        componentId,
      },
    });
  }
}
