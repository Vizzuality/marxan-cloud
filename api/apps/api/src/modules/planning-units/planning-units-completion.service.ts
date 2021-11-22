import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { PlanningUnitsJob } from '@marxan-jobs/planning-unit-geometry';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';

import { CreateApiEventDTO } from '../api-events/dto/create.api-event.dto';
import {
  queueEventsFactoryToken,
  queueToken,
} from './planning-units-queue.provider';
import { EventBus } from '@nestjs/cqrs';
import { PlanningUnitSet } from '@marxan/planning-units-grid';

@Injectable()
export class PlanningUnitsCompletionService
  implements EventFactory<PlanningUnitsJob> {
  private queueEvents: QueueEventsAdapter<PlanningUnitsJob>;

  constructor(
    @Inject(queueToken)
    private readonly queue: Queue<PlanningUnitsJob, void>,
    private readonly events: ApiEventsService,
    @Inject(queueEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<PlanningUnitsJob>,
    private readonly eventBus: EventBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on(`completed`, async (data) => {
      await this.completed(data);
    });
  }

  async createCompletedEvent(
    eventData: EventData<PlanningUnitsJob, unknown>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = API_EVENT_KINDS.project__planningUnits__finished__v1__alpha;
    return {
      topic: data.projectId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        projectId: data.projectId,
        planningAreaId: data.planningAreaId,
      },
    };
  }

  async createFailedEvent(
    eventData: EventData<PlanningUnitsJob, unknown>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = API_EVENT_KINDS.project__planningUnits__failed__v1__alpha;
    return {
      topic: data.projectId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        projectId: data.projectId,
        planningAreaId: data.planningAreaId,
      },
    };
  }

  private async completed(event: EventData<PlanningUnitsJob>) {
    const jobData = await event.data;
    await this.eventBus.publish(new PlanningUnitSet(jobData.projectId));
  }
}
