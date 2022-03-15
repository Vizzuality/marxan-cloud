import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { ConsoleLogger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ExportRepository } from '../../export/application/export-repository.port';
import { MarkExportAsFinished } from './mark-export-as-finished.command';

@CommandHandler(MarkExportAsFinished)
export class MarkExportAsFinishedHandler
  implements IInferredCommandHandler<MarkExportAsFinished>
{
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__finished__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__finished__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly exportRepository: ExportRepository,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(MarkExportAsFinishedHandler.name);
  }

  async execute({ exportId }: MarkExportAsFinished): Promise<void> {
    const exportInstance = await this.exportRepository.find(exportId);

    if (!exportInstance) {
      this.logger.error(`Export with ID ${exportId.value} not found`);
      return;
    }
    const { resourceKind, resourceId } = exportInstance.toSnapshot();

    const kind = this.eventMapper[resourceKind];

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId,
      data: {
        exportId: exportId.value,
        resourceId,
        resourceKind,
      },
    });
  }
}
