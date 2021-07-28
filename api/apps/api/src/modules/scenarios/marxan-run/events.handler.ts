import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue, QueueEvents } from 'bullmq';
import { JobData, ProgressData } from '@marxan/scenario-run-queue';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { assertDefined } from '@marxan/utils';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { ScenarioRunProgressV1Alpha1DTO } from '@marxan-api/modules/api-events/dto/scenario-run-progress-v1-alpha-1';
import { runEventsToken, runQueueToken } from './tokens';

@Injectable()
export class EventsHandler {
  constructor(
    @Inject(runQueueToken)
    private readonly queue: Queue<JobData>,
    @Inject(runEventsToken)
    queueEvents: QueueEvents,
    private readonly apiEvents: ApiEventsService,
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
