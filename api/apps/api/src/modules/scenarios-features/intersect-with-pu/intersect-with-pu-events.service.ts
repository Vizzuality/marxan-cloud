import { Inject, Injectable } from '@nestjs/common';
import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';

import { intersectFeaturesWithPuQueueEventsFactoryToken } from './intersect-queue.providers';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { JobInput } from '@marxan/planning-unit-features';

@Injectable()
export class IntersectWithPuEventsService implements EventFactory<JobInput> {
  private queueEvents: QueueEventsAdapter<JobInput>;

  constructor(
    @Inject(intersectFeaturesWithPuQueueEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<JobInput>,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on(`completed`, async (data) => {
      await this.completed(data);
    });
  }

  async createCompletedEvent(
    eventData: EventData<JobInput>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    return {
      topic: data.scenarioId,
      kind:
        API_EVENT_KINDS.scenario__featuresWithPuIntersection__finished__v1__alpha1,
      externalId: eventData.eventId,
    };
  }

  async createFailedEvent(
    eventData: EventData<JobInput>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    return {
      topic: data.scenarioId,
      kind:
        API_EVENT_KINDS.scenario__featuresWithPuIntersection__failed__v1__alpha1,
      externalId: eventData.eventId,
    };
  }

  private async completed(_data: EventData<JobInput>) {
    //
  }
}
