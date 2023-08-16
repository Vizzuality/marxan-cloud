import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { assertDefined } from '@marxan/utils';
import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';

import {
  JobInput,
  JobOutput,
} from '@marxan/protected-areas';

import { projectProtectedAreaEventsFactoryToken } from './queue.providers';
import {ProtectedAreaForProjectCreatedEvent} from "@marxan/protected-areas/protected-area-created.event";

@Injectable()
export class AddProtectedAreaHandler
  implements EventFactory<JobInput, JobOutput> {
  private queueEvents: QueueEventsAdapter<JobInput, JobOutput>;

  constructor(
    @Inject(projectProtectedAreaEventsFactoryToken)
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
    const kind = API_EVENT_KINDS.project__protectedAreas__finished__v1__alpha;
    return {
      topic: data.projectId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        projectId: data.projectId,
      },
    };
  }

  async createFailedEvent(
    eventData: EventData<JobInput, JobOutput>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = API_EVENT_KINDS.project__protectedAreas__failed__v1__alpha;
    return {
      topic: data.projectId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        projectId: data.projectId,
      },
    };
  }

  private async completed(event: EventData<JobInput, JobOutput>) {
    const data = await event.data;
    const result = await event.result;
    assertDefined(result);
    this.eventBus.publish(
      new ProtectedAreaForProjectCreatedEvent(
        data.projectId,
        result.protectedAreaId,
      ),
    );
  }
}
