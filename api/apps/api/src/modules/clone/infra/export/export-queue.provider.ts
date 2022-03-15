import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';
import { ExportJobInput, exportPieceQueueName } from '@marxan/cloning';
import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';

export const exportPieceQueueToken = Symbol('export piece queue token');
export const exportPieceEventsToken = Symbol('export piece events token');
export const exportPieceEventsFactoryToken = Symbol(
  'export piece queue' + ' factory token',
);

export const exportPieceQueueProvider: FactoryProvider<Queue<ExportJobInput>> =
  {
    provide: exportPieceQueueToken,
    useFactory: (queueBuilder: QueueBuilder<ExportJobInput>) => {
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
  CreateWithEventFactory<ExportJobInput>
> = {
  provide: exportPieceEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<ExportJobInput>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    exportPieceQueueToken,
    exportPieceEventsToken,
  ],
};
