import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { FeaturesJobData } from '@marxan/geofeature-calculations';
import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { copyEventsFactoryToken } from './queue-providers';
import { FeaturesCalculated } from './features-calculated.event';

@Injectable()
export class CopyEventsHandler implements EventFactory<FeaturesJobData> {
  private queueEvents: QueueEventsAdapter<FeaturesJobData>;

  constructor(
    @Inject(copyEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<FeaturesJobData>,
    private readonly eventBus: EventBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on(`completed`, async (data) => {
      await this.completed(data);
    });
  }

  async createCompletedEvent(
    eventData: EventData<FeaturesJobData>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = API_EVENT_KINDS.scenario__geofeatureCopy__finished__v1__alpha1;
    return {
      topic: data.scenarioId,
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
    const kind = API_EVENT_KINDS.scenario__geofeatureCopy__failed__v1__alpha1;
    return {
      topic: data.scenarioId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        featureId: data.featureId,
      },
    };
  }

  private async completed(event: EventData<FeaturesJobData>) {
    const data = await event.data;
    this.eventBus.publish(
      new FeaturesCalculated([data.featureId], data.specificationId),
    );
  }
}
