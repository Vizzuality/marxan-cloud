import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ExportRepository } from '../../export/application/export-repository.port';
import { MarkExportAsFailed } from './mark-export-as-failed.command';

@CommandHandler(MarkExportAsFailed)
export class MarkExportAsFailedHandler
  implements IInferredCommandHandler<MarkExportAsFailed> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__failed__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__failed__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly exportRepository: ExportRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MarkExportAsFailedHandler.name);
  }

  async execute({ exportId }: MarkExportAsFailed): Promise<void> {
    const exportInstance = await this.exportRepository.find(exportId);

    if (!exportInstance) {
      this.logger.error(`Export with ID ${exportId.value} not found`);
      return;
    }

    const { resourceId, resourceKind } = exportInstance;

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
