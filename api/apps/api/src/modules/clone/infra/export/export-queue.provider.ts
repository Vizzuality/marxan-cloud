import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { JobInput, exportPieceQueueName } from '@marxan/cloning';
import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';
import { PlanningUnitsJob } from '@marxan-jobs/planning-unit-geometry';

export const exportPieceQueueToken = Symbol('export piece queue token');
export const exportPieceEventsToken = Symbol('export piece events token');
export const exportPieceEventsFactoryToken = Symbol(
  'export piece queue' + ' factory token',
);

export const exportPieceQueueProvider: FactoryProvider<Queue<JobInput>> = {
  provide: exportPieceQueueToken,
  useFactory: (queueBuilder: QueueBuilder<JobInput>) => {
    return queueBuilder.buildQueue(exportPieceQueueName);
  },
  inject: [QueueBuilder],
};
export const exportPiecenQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: exportPieceEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(exportPieceQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const exportPieceEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<PlanningUnitsJob>
> = {
  provide: exportPieceEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<PlanningUnitsJob>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    exportPieceQueueToken,
    exportPieceEventsToken,
  ],
};
