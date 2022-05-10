import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';
import {
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  legacyProjectImportQueueName,
} from '@marxan/legacy-project-import';
import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';

export const importLegacyProjectPieceQueueToken = Symbol(
  'import legacy project piece queue token',
);
export const importLegacyProjectPieceEventsToken = Symbol(
  'import legacy project piece events token',
);
export const importLegacyProjectPieceEventsFactoryToken = Symbol(
  'import legacy project piece queue factory token',
);

export const importLegacyProjectPieceQueueProvider: FactoryProvider<
  Queue<LegacyProjectImportJobInput, LegacyProjectImportJobOutput>
> = {
  provide: importLegacyProjectPieceQueueToken,
  useFactory: (
    queueBuilder: QueueBuilder<
      LegacyProjectImportJobInput,
      LegacyProjectImportJobOutput
    >,
  ) => {
    return queueBuilder.buildQueue(legacyProjectImportQueueName);
  },
  inject: [QueueBuilder],
};
export const importLegacyProjectPiecenQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: importLegacyProjectPieceEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(legacyProjectImportQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const importLegacyProjectPieceEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<
    LegacyProjectImportJobInput,
    LegacyProjectImportJobOutput
  >
> = {
  provide: importLegacyProjectPieceEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<LegacyProjectImportJobInput, LegacyProjectImportJobOutput>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    importLegacyProjectPieceQueueToken,
    importLegacyProjectPieceEventsToken,
  ],
};
