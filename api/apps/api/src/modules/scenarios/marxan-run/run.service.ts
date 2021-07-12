import { Job, Queue, QueueEvents } from 'bullmq';
import { Either, left, right } from 'fp-ts/Either';
import { FactoryProvider, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { assertDefined, isDefined } from '@marxan/utils';
import { JobData, queueName } from '@marxan/scenario-run-queue';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import { Scenario } from '../scenario.api.entity';
import { AssetsService } from './assets.service';

export const runQueueToken = Symbol('run queue token');
export const runEventsToken = Symbol('run events token');
export const runQueueProvider: FactoryProvider<Queue<JobData>> = {
  provide: runQueueToken,
  useFactory: (queueBuilder: QueueBuilder<JobData>) => {
    return queueBuilder.buildQueue(queueName);
  },
  inject: [QueueBuilder],
};
export const runQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: runEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(queueName);
  },
  inject: [QueueEventsBuilder],
};

export const notFound = Symbol('not found');
export type NotFound = typeof notFound;

@Injectable()
export class RunService {
  constructor(
    @Inject(runQueueToken)
    private readonly queue: Queue<JobData>,
    @Inject(runEventsToken)
    queueEvents: QueueEvents,
    private readonly apiEvents: ApiEventsService,
    @InjectRepository(Scenario)
    private readonly scenarios: Repository<Scenario>,
    private readonly assets: AssetsService,
  ) {
    queueEvents.on(`completed`, ({ jobId }) => this.handleFinished(jobId));
    queueEvents.on(`failed`, ({ jobId }) => this.handleFailed(jobId));
  }

  async run(scenarioId: string): Promise<void> {
    const assets = await this.assets.forScenario(scenarioId);
    assertDefined(assets);
    await this.queue.add(`run-scenario`, {
      scenarioId,
      assets,
    });
    await this.scenarios.update(scenarioId, {
      ranAtLeastOnce: true,
    });
    await this.apiEvents.create({
      topic: scenarioId,
      kind: API_EVENT_KINDS.scenario__run__submitted__v1__alpha1,
    });
  }

  async cancel(scenarioId: string): Promise<Either<NotFound, void>> {
    const activeJobs: Job<JobData>[] = await this.queue.getJobs([
      'active',
      'waiting',
    ]);
    const scenarioJob = activeJobs.find(
      (job) => job.data.scenarioId === scenarioId,
    );
    if (!isDefined(scenarioJob)) return left(notFound);

    if (await scenarioJob.isActive())
      await scenarioJob.updateProgress({
        canceled: true,
        scenarioId,
      });
    else if (await scenarioJob.isWaiting()) await scenarioJob.remove();

    return right(void 0);
  }

  private async handleFinished(jobId: string) {
    const job = await this.getJob(jobId);
    await this.apiEvents.create({
      topic: job.data.scenarioId,
      kind: API_EVENT_KINDS.scenario__run__finished__v1__alpha1,
    });
  }

  private async handleFailed(jobId: string) {
    const job = await this.getJob(jobId);
    await this.apiEvents.create({
      topic: job.data.scenarioId,
      kind: API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
    });
  }

  private async getJob(jobId: string): Promise<Job<JobData>> {
    const job = await this.queue.getJob(jobId);
    assertDefined(job);
    return job;
  }
}
