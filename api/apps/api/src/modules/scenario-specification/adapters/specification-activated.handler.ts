import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { SpecificationProcessingFinishedEvent } from './specification-processing-finished.event';

@EventsHandler(SpecificationProcessingFinishedEvent)
export class SpecificationActivatedHandler
  implements IEventHandler<SpecificationProcessingFinishedEvent>
{
  constructor(private readonly apiEvents: ApiEventsService) {}

  async handle(event: SpecificationProcessingFinishedEvent) {
    await this.apiEvents.create({
      kind: API_EVENT_KINDS.scenario__specification__finished__v1__alpha1,
      topic: event.scenarioId,
      data: { ...event },
    });
  }
}
