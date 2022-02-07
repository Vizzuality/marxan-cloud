import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { JobInput } from '@marxan/scenario-cost-surface';
import { Inject, Injectable } from '@nestjs/common';
import { surfaceCostEventsFactoryToken } from './surface-cost-queue.provider';

type EventKind = { event: API_EVENT_KINDS };

@Injectable()
export class SurfaceCostEventsHandler implements EventFactory<JobInput, true> {
  private queueEvents: QueueEventsAdapter<JobInput, true>;

  private failEventsMapper: EventKind = {
    event: API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
  };

  private successEventsMapper: EventKind = {
    event: API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
  };

  constructor(
    @Inject(surfaceCostEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<JobInput, true>,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on('failed', this.failed);
  }

  async createCompletedEvent(
    eventData: EventData<JobInput, true>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = this.successEventsMapper.event;

    return {
      topic: data.scenarioId,
      kind,
      data: {},
    };
  }

  async createFailedEvent(
    eventData: EventData<JobInput, true>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = this.failEventsMapper.event;

    return {
      topic: data.scenarioId,
      kind,
      data: {},
    };
  }

  async failed(eventData: EventData<JobInput, true>): Promise<void> {
    // TODO Remove scenario sending a command
  }
}
