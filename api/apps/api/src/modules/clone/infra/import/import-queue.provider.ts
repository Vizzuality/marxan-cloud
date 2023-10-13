import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';
import { ImportJobInput, importPieceQueueName } from '@marxan/cloning';
import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';

export const importPieceQueueToken = Symbol('import piece queue token');
export const importPieceEventsToken = Symbol('import piece events token');
export const importPieceEventsFactoryToken = Symbol(
  'import piece queue' + ' factory token',
);

export const importPieceQueueProvider: FactoryProvider<Queue<ImportJobInput>> =
  {
    provide: importPieceQueueToken,
    useFactory: (queueBuilder: QueueBuilder<ImportJobInput>) => {
      return queueBuilder.buildQueue(importPieceQueueName);
    },
    inject: [QueueBuilder],
  };
export const importPiecenQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: importPieceEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(importPieceQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const importPieceEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<ImportJobInput>
> = {
  provide: importPieceEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<ImportJobInput>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    importPieceQueueToken,
    importPieceEventsToken,
  ],
};
