import { Job, Queue, QueueEvents } from 'bullmq';
import { Either, left, right } from 'fp-ts/Either';
import { FactoryProvider, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { assertDefined, isDefined } from '@marxan/utils';
import { JobData, ProgressData, queueName } from '@marxan/scenario-run-queue';
import { ScenarioRunProgressV1Alpha1DTO } from '@marxan-api/modules/api-events/dto/scenario-run-progress-v1-alpha-1';
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
    queueEvents.on(`completed`, ({ jobId }, eventId) =>
      this.handleFinished(jobId, eventId),
    );
    queueEvents.on(`failed`, ({ jobId }, eventId) =>
      this.handleFailed(jobId, eventId),
    );
    queueEvents.on(
      `progress`,
      async (
        { jobId, data }: { data: ProgressData; jobId: string },
        eventId,
      ) => {
        await this.handleProgress(jobId, eventId, data);
      },
    );
  }

  async run(scenarioId: string): Promise<void> {
    const assets = await this.assets.forScenario(scenarioId);
    assertDefined(assets);
    const job = await this.queue.add(`run-scenario`, {
      scenarioId,
      assets,
    });
    await this.scenarios.update(scenarioId, {
      ranAtLeastOnce: true,
    });
    const kind = API_EVENT_KINDS.scenario__run__submitted__v1__alpha1;
    await this.apiEvents.create({
      topic: scenarioId,
      kind,
      externalId: job.id + kind,
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

  private async handleProgress(
    jobId: string,
    eventId: string,
    progress: ProgressData | null,
  ) {
    if (
      typeof progress !== 'object' ||
      progress === null ||
      !('fractionalProgress' in progress)
    )
      return;
    const job = await this.getJob(jobId);
    const kind = API_EVENT_KINDS.scenario__run__progress__v1__alpha1;
    const eventData: ScenarioRunProgressV1Alpha1DTO = {
      kind,
      fractionalProgress: progress.fractionalProgress,
    };
    await this.apiEvents.createIfNotExists({
      topic: job.data.scenarioId,
      kind,
      externalId: eventId,
      data: eventData,
    });
  }

  private async handleFinished(jobId: string, eventId: string) {
    const job = await this.getJob(jobId);
    const kind = API_EVENT_KINDS.scenario__run__finished__v1__alpha1;
    await this.apiEvents.createIfNotExists({
      topic: job.data.scenarioId,
      kind,
      externalId: eventId,
    });
  }

  private async handleFailed(jobId: string, eventId: string) {
    const job = await this.getJob(jobId);
    const kind = API_EVENT_KINDS.scenario__run__failed__v1__alpha1;
    await this.apiEvents.createIfNotExists({
      topic: job.data.scenarioId,
      kind,
      externalId: eventId,
    });
  }

  private async getJob(jobId: string): Promise<Job<JobData>> {
    const job = await this.queue.getJob(jobId);
    assertDefined(job);
    return job;
  }
}
