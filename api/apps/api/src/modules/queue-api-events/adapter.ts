import TypedEmitter from 'typed-emitter';
import { EventEmitter } from 'events';
import { Job, Queue, QueueEvents as BullmqQueueEvents } from 'bullmq';
import { Either, isLeft, Left } from 'fp-ts/Either';
import { assertDefined } from '@marxan/utils';
import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import {
  ApiEventsService,
  duplicate,
} from '@marxan-api/modules/api-events/api-events.service';

export interface EventData<JobData, Result = unknown> {
  jobId: string;
  eventId: string;
  data: Promise<JobData>;
  result: Promise<Result | undefined>;
}

interface QueueEvents<JobData, Result = unknown> {
  completed(eventData: EventData<JobData, Result>): void;

  failed(eventData: EventData<JobData>): void;
}

export type EventFactory<JobData, Result = unknown> = {
  createCompletedEvent: (
    eventData: EventData<JobData, Result>,
  ) => Promise<CreateApiEventDTO>;
  createFailedEvent: (
    eventData: EventData<JobData, Result>,
  ) => Promise<CreateApiEventDTO>;
};

const QueueEventsEmitter = EventEmitter;

export class QueueEventsAdapter<
  JobData,
  Result = unknown,
> extends QueueEventsEmitter {
  constructor(
    private readonly queue: Queue<JobData, Result>,
    queueEvents: BullmqQueueEvents,
    private readonly apiEvents: ApiEventsService,
    private readonly eventFactory: EventFactory<JobData, Result>,
  ) {
    super();
    queueEvents.on(`completed`, ({ jobId }, eventId) =>
      this.handleFinished(jobId, eventId),
    );
    queueEvents.on(`failed`, ({ jobId }, eventId) =>
      this.handleFailed(jobId, eventId),
    );
  }

  private async handleFinished(jobId: string, eventId: string) {
    const lazyDataGetter = this.createLazyDataGetter();
    const lazyResultGetter = this.createLazyResultGetter();
    const eventDto = await this.eventFactory.createCompletedEvent({
      jobId,
      eventId,
      get data() {
        return lazyDataGetter(jobId);
      },
      get result() {
        return lazyResultGetter(jobId);
      },
    });
    const result = await this.apiEvents.createIfNotExists(eventDto);
    if (this.isDuplicate(result)) {
      return;
    }
    this.emit(`completed`, {
      jobId,
      eventId,
      get data() {
        return lazyDataGetter(jobId);
      },
      get result() {
        return lazyResultGetter(jobId);
      },
    });
  }

  private async handleFailed(jobId: string, eventId: string) {
    const lazyDataGetter = this.createLazyDataGetter();
    const eventDto = await this.eventFactory.createFailedEvent({
      jobId,
      eventId,
      get data() {
        return lazyDataGetter(jobId);
      },
      get result() {
        return Promise.resolve(undefined);
      },
    });
    const result = await this.apiEvents.createIfNotExists(eventDto);
    if (this.isDuplicate(result)) {
      return;
    }
    this.emit(`failed`, {
      jobId,
      eventId,
      get data() {
        return lazyDataGetter(jobId);
      },
      get result() {
        return Promise.resolve(undefined);
      },
    });
  }

  private isDuplicate: (
    result: Either<typeof duplicate, ApiEvent>,
  ) => result is Left<typeof duplicate> = isLeft;

  private createLazyDataGetter() {
    let data: JobData | undefined;
    return async (jobId: string) => {
      if (data) {
        return data;
      }
      const job = await this.getJob(jobId);
      data = job.data;
      return data;
    };
  }

  private createLazyResultGetter() {
    let data: Result | undefined;
    return async (jobId: string) => {
      if (data) {
        return data;
      }
      const job = await this.getJob(jobId);
      data = job.returnvalue;
      return data;
    };
  }

  private async getJob(jobId: string): Promise<Job<JobData>> {
    const job: Job<JobData> | undefined = await this.queue.getJob(jobId);
    assertDefined(job);
    return job;
  }
}
