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

export interface EventData<JobData> {
  jobId: string;
  eventId: string;
  data: Promise<JobData>;
}

interface QueueEvents<JobData> {
  completed(eventData: EventData<JobData>): void;

  failed(eventData: EventData<JobData>): void;
}

export type EventFactory<JobData> = {
  createCompletedEvent: (
    eventData: EventData<JobData>,
  ) => Promise<CreateApiEventDTO>;
  createFailedEvent: (
    eventData: EventData<JobData>,
  ) => Promise<CreateApiEventDTO>;
};

const QueueEventsEmitter: new <JobData>() => TypedEmitter<
  QueueEvents<JobData>
> = EventEmitter;

export class QueueEventsAdapter<JobData> extends QueueEventsEmitter<JobData> {
  constructor(
    private readonly queue: Queue<JobData>,
    queueEvents: BullmqQueueEvents,
    private readonly apiEvents: ApiEventsService,
    private readonly eventFactory: EventFactory<JobData>,
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
    const eventDto = await this.eventFactory.createCompletedEvent({
      jobId,
      eventId,
      get data() {
        return lazyDataGetter(jobId);
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

  private async getJob(jobId: string): Promise<Job<JobData>> {
    const job: Job<JobData> | undefined = await this.queue.getJob(jobId);
    assertDefined(job);
    return job;
  }
}
