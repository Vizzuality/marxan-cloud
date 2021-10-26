import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { JobInput, JobOutput } from '@marxan/planning-units-grid';
import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { CustomPlanningUnitGridSet } from '../events/custom-planning-unit-grid-set.event';

import { setPlanningUnitGridEventsFactoryToken } from './queue.providers';

@Injectable()
export class PlanningUnitGridEventsHandler
  implements EventFactory<JobInput, JobOutput> {
  private queueEvents: QueueEventsAdapter<JobInput, JobOutput>;

  constructor(
    @Inject(setPlanningUnitGridEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<JobInput, JobOutput>,
    private readonly eventBus: EventBus,
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
      topic: data.projectId,
      kind: API_EVENT_KINDS.project__grid__finished__v1__alpha,
      externalId: eventData.eventId,
      data: {
        payload: data,
      },
    };
  }

  async createFailedEvent(
    eventData: EventData<JobInput>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    return {
      topic: data.projectId,
      kind: API_EVENT_KINDS.project__grid__failed__v1__alpha,
      externalId: eventData.eventId,
      data: {
        payload: data,
      },
    };
  }

  private async completed(eventData: EventData<JobInput, JobOutput>) {
    const result = await eventData.result;
    if (!result) {
      return;
    }
    this.eventBus.publish(
      new CustomPlanningUnitGridSet(
        result.projectId,
        result.planningAreaId,
        result.bbox,
      ),
    );
  }
}
