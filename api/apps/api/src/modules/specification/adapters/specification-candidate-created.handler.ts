import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SpecificationCandidateCreated } from '../domain';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';

@EventsHandler(SpecificationCandidateCreated)
export class SpecificationCandidateCreatedHandler
  implements IEventHandler<SpecificationCandidateCreated> {
  constructor(private readonly apiEvents: ApiEventsService) {}

  async handle(event: SpecificationCandidateCreated) {
    await this.apiEvents.create({
      kind: API_EVENT_KINDS.scenario__specification__submitted__v1__alpha1,
      topic: event.scenarioId,
      data: { ...event },
    });
  }
}
