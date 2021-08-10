import { Inject, Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { FeaturesJobData } from '@marxan/geofeature-calculations';
import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { stratificationEventsFactoryToken } from './queue-providers';

@Injectable()
export class StratificationEventsHandler
  implements EventFactory<FeaturesJobData> {
  private queueEvents: QueueEventsAdapter<FeaturesJobData>;

  constructor(
    @Inject(stratificationEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<FeaturesJobData>,
  ) {
    this.queueEvents = queueEventsFactory(this);
  }

  async createCompletedEvent(
    eventData: EventData<FeaturesJobData>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind =
      API_EVENT_KINDS.scenario__geofeatureStratification__finished__v1__alpha1;
    return {
      topic: data.featureId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        featureId: data.featureId,
      },
    };
  }

  async createFailedEvent(
    eventData: EventData<FeaturesJobData>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind =
      API_EVENT_KINDS.scenario__geofeatureStratification__failed__v1__alpha1;
    return {
      topic: data.featureId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        featureId: data.featureId,
      },
    };
  }
}
