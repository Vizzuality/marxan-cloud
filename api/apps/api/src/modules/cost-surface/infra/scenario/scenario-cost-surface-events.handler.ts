import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ScenarioCostSurfaceJobInput } from '@marxan/artifact-cache/surface-cost-job-input';
import { ScenarioCostSurfaceFactoryToken } from '@marxan-api/modules/cost-surface/infra/scenario/scenario-cost-surface-queue.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Repository } from 'typeorm';
import { DeleteScenario } from '@marxan-api/modules/scenarios/delete-scenario/delete-scenario.command';

type EventKind = { event: API_EVENT_KINDS };

@Injectable()
export class ScenarioCostSurfaceEventsHandler
  implements EventFactory<ScenarioCostSurfaceJobInput, true>
{
  private queueEvents: QueueEventsAdapter<ScenarioCostSurfaceJobInput, true>;

  private failEventsMapper: EventKind = {
    event: API_EVENT_KINDS.scenario__costSurface__link__failed__v1_alpha1,
  };

  private successEventsMapper: EventKind = {
    event: API_EVENT_KINDS.scenario__costSurface__link__finished__v1_alpha1,
  };

  constructor(
    @Inject(ScenarioCostSurfaceFactoryToken)
    queueEventsFactory: CreateWithEventFactory<
      ScenarioCostSurfaceJobInput,
      true
    >,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    private readonly commandBus: CommandBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on('failed', (data) => this.failed(data));
  }

  async createCompletedEvent(
    eventData: EventData<ScenarioCostSurfaceJobInput, true>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = this.successEventsMapper.event;

    return {
      topic: data.scenarioId,
      kind,
      data,
    };
  }

  async createFailedEvent(
    eventData: EventData<ScenarioCostSurfaceJobInput, true>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = this.failEventsMapper.event;

    return {
      topic: data.scenarioId,
      kind,
      data,
    };
  }

  async failed(
    eventData: EventData<ScenarioCostSurfaceJobInput, unknown>,
  ): Promise<void> {
    const jobInput = await eventData.data;
    if (jobInput.mode === 'update') {
      await this.scenarioRepo.update(jobInput.scenarioId, {
        costSurfaceId: jobInput.originalCostSurfaceId,
      });
    } else if (jobInput.mode === 'creation') {
      await this.commandBus.execute(new DeleteScenario(jobInput.scenarioId));
    }
  }
}
