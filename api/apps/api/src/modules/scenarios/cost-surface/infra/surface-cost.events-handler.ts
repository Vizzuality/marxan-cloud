import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { FromShapefileJobInput, JobInput } from '@marxan/artifact-cache';
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteScenario } from './delete-scenario.command';
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
    private readonly commandBus: CommandBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on('failed', (data) => this.failed(data));
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

  async failed(eventData: EventData<JobInput, unknown>): Promise<void> {
    const jobInput = await eventData.data;

    const isFromShapefileJob = Boolean(
      (jobInput as FromShapefileJobInput).shapefile,
    );
    if (!isFromShapefileJob) {
      await this.commandBus.execute(new DeleteScenario(jobInput.scenarioId));
    }
  }
}
