import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { MarkLegacyProjectImportAsCanceled } from './mark-legacy-project-import-as-canceled.command';

@CommandHandler(MarkLegacyProjectImportAsCanceled)
export class MarkLegacyProjectImportAsCanceledHandler
  implements IInferredCommandHandler<MarkLegacyProjectImportAsCanceled>
{
  private readonly logger: Logger = new Logger(
    MarkLegacyProjectImportAsCanceledHandler.name,
  );

  constructor(private readonly apiEvents: ApiEventsService) {}

  async execute({
    projectId,
  }: MarkLegacyProjectImportAsCanceled): Promise<void> {
    const kind = API_EVENT_KINDS.project__legacy__import__canceled__v1__alpha;
    const topic = projectId.value;

    await this.apiEvents.createIfNotExists({
      kind,
      topic,
      data: {
        projectId: topic,
      },
    });
  }
}
