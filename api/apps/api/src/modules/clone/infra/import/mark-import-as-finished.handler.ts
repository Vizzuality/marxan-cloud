import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceKind } from '@marxan/cloning/domain';
import { Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ImportRepository } from '../../import/application/import.repository.port';
import { MarkImportAsFinished } from './mark-import-as-finished.command';

@CommandHandler(MarkImportAsFinished)
export class MarkImportAsFinishedHandler
  implements IInferredCommandHandler<MarkImportAsFinished> {
  private eventMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__finished__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__finished__v1__alpha,
  };

  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MarkImportAsFinishedHandler.name);
  }

  private async emitSyntheticEvents(projectId: string): Promise<void> {
    const kind = API_EVENT_KINDS.project__planningUnits__finished__v1__alpha;

    await this.apiEvents.createIfNotExists({
      topic: projectId,
      kind,
      data: {
        kind,
        projectId,
        syntheticEvent: true,
      },
    });
  }

  async execute({
    importId,
    resourceId,
    resourceKind,
  }: MarkImportAsFinished): Promise<void> {
    const kind = this.eventMapper[resourceKind];

    if (resourceKind === ResourceKind.Project) {
      /**
       * Since api events aren't copied when cloning operations are dispatched
       * and some use cases depend on api events, we have to create "synthetic"
       * events when importing projects. For the time being, these are the
       * events needed:
       *
       * - project__planningUnits__finished__v1__alpha: To be able to create a scenario
       *   it is required to have processed the planning units grid of the project.
       *   This check is made by ensuring that there is a api event of this type associated
       *   to the project
       */
      await this.emitSyntheticEvents(resourceId.value);
    }

    await this.apiEvents.createIfNotExists({
      kind,
      topic: resourceId.value,
      data: {
        importId: importId.value,
        resourceId: resourceId.value,
        resourceKind,
      },
    });
  }
}
