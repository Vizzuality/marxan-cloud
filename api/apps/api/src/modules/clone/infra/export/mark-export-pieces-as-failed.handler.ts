import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { MarkExportPiecesAsFailed } from '@marxan-api/modules/clone/infra/export/mark-export-pieces-as-failed.command';

@CommandHandler(MarkExportPiecesAsFailed)
export class MarkExportPiecesAsFailedHandler
  implements IInferredCommandHandler<MarkExportPiecesAsFailed> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__piece__failed__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__piece__failed__v1__alpha,
  };

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    exportId,
    resourceId,
    resourceKind,
    componentsId,
  }: MarkExportPiecesAsFailed): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    await Promise.all(
      componentsId.map((componentId) =>
        this.apiEvents.createIfNotExists({
          externalId: ApiEventsService.composeExternalId(
            componentId.value,
            kind,
          ),
          kind,
          topic: componentId.value,
          data: {
            exportId: exportId.value,
            resourceId: resourceId.value,
            resourceKind,
            componentId: componentId.value,
          },
        }),
      ),
    );
  }
}
