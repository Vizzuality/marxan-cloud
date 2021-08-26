import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { SpecificationApiEntity } from '@marxan-api/modules/specification/adapters/specification.api.entity';
import { SpecificationActivated } from '../domain';

@EventsHandler(SpecificationActivated)
export class SpecificationActivatedHandler
  implements IEventHandler<SpecificationActivated> {
  constructor(
    private readonly apiEvents: ApiEventsService,
    @InjectRepository(SpecificationApiEntity)
    private readonly specifications: Repository<SpecificationApiEntity>,
  ) {}

  async handle(event: SpecificationActivated) {
    const specification = await this.specifications.findOne(
      event.specificationId.value,
    );
    if (!specification) return;
    await this.apiEvents.create({
      kind: API_EVENT_KINDS.scenario__specification__finished__v1__alpha1,
      topic: specification.scenarioId,
      data: { ...event },
    });
  }
}
