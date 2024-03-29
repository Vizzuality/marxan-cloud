import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ExportRepository } from '../../export/application/export-repository.port';
import { MarkExportAsFailed } from './mark-export-as-failed.command';

@CommandHandler(MarkExportAsFailed)
export class MarkExportAsFailedHandler
  implements IInferredCommandHandler<MarkExportAsFailed>
{
  private readonly logger: Logger = new Logger(MarkExportAsFailedHandler.name);

  private exportEventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__failed__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__failed__v1__alpha,
  };
  private cloneEventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__clone__failed__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__clone__failed__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly exportRepository: ExportRepository,
  ) {}

  async execute({ exportId, reason }: MarkExportAsFailed): Promise<void> {
    const exportInstance = await this.exportRepository.find(exportId);

    if (!exportInstance) {
      this.logger.error(`Export with ID ${exportId.value} not found`);
      return;
    }

    const { resourceId, resourceKind } = exportInstance;

    const exportKind = this.exportEventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind: exportKind,
      topic: resourceId.value,
      data: {
        exportId: exportId.value,
        resourceId: resourceId.value,
        resourceKind,
        reason,
      },
    });

    if (exportInstance.isCloning()) {
      const cloneKind = this.cloneEventMapper[resourceKind];
      const importResourceId = exportInstance.importResourceId!.value;

      await this.apiEvents.createIfNotExists({
        kind: cloneKind,
        topic: importResourceId,
        data: {
          resourceId: importResourceId,
          resourceKind,
          reason: 'Export failed' + reason ? ` - ${reason}` : '',
        },
      });
    }
  }
}
