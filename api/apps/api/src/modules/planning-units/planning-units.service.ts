import { FactoryProvider, Inject, Injectable } from '@nestjs/common';

import { Job, Queue, QueueEvents } from 'bullmq';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  PlanningUnitsJob,
  createQueueName,
} from '@marxan-jobs/planning-unit-geometry';
import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';

export const queueToken = Symbol(`planning unit queue token`);
export const queueProvider: FactoryProvider<Queue<PlanningUnitsJob, void>> = {
  provide: queueToken,
  useFactory: (builder: QueueBuilder) => builder.buildQueue(createQueueName),
  inject: [QueueBuilder],
};
export const queueEventsToken = Symbol(`planning units queue events token`);
export const queueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: queueEventsToken,
  useFactory: (builder: QueueEventsBuilder) =>
    builder.buildQueueEvents(createQueueName),
  inject: [QueueEventsBuilder],
};

type CompletedEvent = { jobId: string; returnvalue: string };
type FailedEvent = { jobId: string; failedReason: string };

@Injectable()
export class PlanningUnitsService {
  constructor(
    @Inject(queueToken)
    private readonly queue: Queue<PlanningUnitsJob, void>,
    @Inject(queueEventsToken)
    private readonly queueEvents: QueueEvents,
    private readonly events: ApiEventsService,
  ) {
    this.queueEvents.on(`completed`, (data, eventId) =>
      this.onCompleted(data, eventId),
    );
    this.queueEvents.on(`failed`, (data, eventId) =>
      this.onFailed(data, eventId),
    );
  }

  public async create(jobDefinition: PlanningUnitsJob): Promise<void> {
    const job = await this.queue.add('create-regular-pu', jobDefinition);
    await this.events.createIfNotExists({
      kind: API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha,
      topic: jobDefinition.projectId,
      externalId: job.id,
    });
  }

  private async onCompleted(data: CompletedEvent, eventId: string) {
    const job: Job<PlanningUnitsJob> | undefined = await this.queue.getJob(
      data.jobId,
    );
    if (!job) return;
    const { projectId } = job.data;
    await this.events.createIfNotExists({
      kind: API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
      topic: projectId,
      externalId: eventId,
    });
  }

  private async onFailed(data: FailedEvent, eventId: string) {
    const job: Job<PlanningUnitsJob> | undefined = await this.queue.getJob(
      data.jobId,
    );
    if (!job) return;
    const { projectId } = job.data;
    await this.events.createIfNotExists({
      kind: API_EVENT_KINDS.project__planningUnits__failed__v1__alpha,
      topic: projectId,
      externalId: eventId,
    });
  }
}
