import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';
import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { ProjectCostSurfaceJobInput } from '@marxan/artifact-cache/surface-cost-job-input';
import { projectCostSurfaceQueueName } from '@marxan/artifact-cache/cost-surface-queue-name';

export const projectCostSurfaceQueueToken = Symbol('export piece queue token');
export const projectCostSurfaceEventsToken = Symbol(
  'export piece events token',
);
export const ProjectCostSurfaceFactoryToken = Symbol(
  'export piece queue' + ' factory token',
);

export const projectCostSurfaceQueueProvider: FactoryProvider<
  Queue<ProjectCostSurfaceJobInput>
> = {
  provide: projectCostSurfaceQueueToken,
  useFactory: (queueBuilder: QueueBuilder<ProjectCostSurfaceJobInput>) => {
    return queueBuilder.buildQueue(projectCostSurfaceQueueName);
  },
  inject: [QueueBuilder],
};
export const projectCostSurfaceQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: projectCostSurfaceEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(projectCostSurfaceQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const projectCostSurfaceEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<ProjectCostSurfaceJobInput>
> = {
  provide: ProjectCostSurfaceFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<ProjectCostSurfaceJobInput>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    projectCostSurfaceQueueToken,
    projectCostSurfaceEventsToken,
  ],
};
