import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { MarkExportPiecesAsFailed } from '@marxan-api/modules/clone/infra/export/mark-export-pieces-as-failed.command';

@CommandHandler(MarkExportPiecesAsFailed)
export class MarkExportPiecesAsFailedHandler
  implements IInferredCommandHandler<MarkExportPiecesAsFailed> {
  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    exportId,
    resourceId,
    resourceKind,
    componentsId,
  }: MarkExportPiecesAsFailed): Promise<void> {
    const kind =
      resourceKind === ResourceKind.Project
        ? API_EVENT_KINDS.project__export__piece__failed__v1__alpha
        : null;

    if (!kind) {
      // TODO update with Scenario once supported.
      return;
    }

    await Promise.all(
      componentsId.map((componentId) =>
        this.apiEvents.createIfNotExists({
          externalId: `${kind}-${componentId.value}`,
          kind,
          topic: resourceId.value,
          data: {
            exportId,
            resourceId,
            resourceKind,
            componentId,
          },
        }),
      ),
    );
  }
}
