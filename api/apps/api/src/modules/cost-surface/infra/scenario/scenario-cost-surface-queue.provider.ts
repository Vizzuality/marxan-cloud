import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';
import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { ScenarioCostSurfaceJobInput } from '@marxan/artifact-cache/surface-cost-job-input';
import { scenarioCostSurfaceQueueName } from '@marxan/artifact-cache/cost-surface-queue-name';

export const scenarioCostSurfaceQueueToken = Symbol(
  'scenarioCostSurfaceQueueToken',
);
export const scenarioCostSurfaceEventsToken = Symbol(
  'scenarioCostSurfaceEventsToken',
);
export const ScenarioCostSurfaceFactoryToken = Symbol(
  'scenarioCostSurfaceEventsToken' + ' factory token',
);

export const scenarioCostSurfaceQueueProvider: FactoryProvider<
  Queue<ScenarioCostSurfaceJobInput>
> = {
  provide: scenarioCostSurfaceQueueToken,
  useFactory: (queueBuilder: QueueBuilder<ScenarioCostSurfaceJobInput>) => {
    return queueBuilder.buildQueue(scenarioCostSurfaceQueueName);
  },
  inject: [QueueBuilder],
};
export const scenarioCostSurfaceQueueEventsProvider: FactoryProvider<QueueEvents> =
  {
    provide: scenarioCostSurfaceEventsToken,
    useFactory: (eventsBuilder: QueueEventsBuilder) => {
      return eventsBuilder.buildQueueEvents(scenarioCostSurfaceQueueName);
    },
    inject: [QueueEventsBuilder],
  };

export const scenarioCostSurfaceEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<ScenarioCostSurfaceJobInput>
> = {
  provide: ScenarioCostSurfaceFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<ScenarioCostSurfaceJobInput>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    scenarioCostSurfaceQueueToken,
    scenarioCostSurfaceEventsToken,
  ],
};
