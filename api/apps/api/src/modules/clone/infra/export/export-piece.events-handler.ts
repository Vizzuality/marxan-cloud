import { Inject, Injectable } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { EventBus } from '@nestjs/cqrs';

import { JobInput, JobOutput } from '@marxan/cloning';

import {
  exportPieceEventsToken,
  exportPieceQueueToken,
} from './export-queue.provider';

// TODO use QueueEventsAdapter once ApiEvents are in place
@Injectable()
export class ExportPieceEventsHandler {
  constructor(
    @Inject(exportPieceQueueToken)
    private readonly queue: Queue<JobInput, JobOutput>,
    @Inject(exportPieceEventsToken)
    queueEvents: QueueEvents,
    private readonly eventBus: EventBus,
  ) {
    queueEvents.on(`completed`, ({ jobId, returnvalue }, eventId) =>
      this.handleFinished(jobId, returnvalue),
    );
    queueEvents.on(`failed`, ({ jobId }, eventId) => {
      //
    });
  }

  private handleFinished(jobId: string, returnValue: string) {
    console.log(`handle finished piece`, returnValue);
    // TODO fill
    // this.eventBus.publish(new ExportComponentFinished())
  }
}
