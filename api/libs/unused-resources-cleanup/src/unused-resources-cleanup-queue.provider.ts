import { QueueBuilder } from '@marxan-api/modules/queue';
import {
  UnusedResourcesCleanupJobInput,
  unusedResourcesCleanupQueueName,
} from '@marxan/unused-resources-cleanup';

import { FactoryProvider } from '@nestjs/common';
import { Queue } from 'bullmq';

export const unusedResourcesCleanupQueueToken = Symbol(
  'failed import db cleanup queue token',
);

export const unusedResourcesCleanupQueueProvider: FactoryProvider<
  Queue<UnusedResourcesCleanupJobInput>
> = {
  provide: unusedResourcesCleanupQueueToken,
  useFactory: (queueBuilder: QueueBuilder<UnusedResourcesCleanupJobInput>) => {
    return queueBuilder.buildQueue(unusedResourcesCleanupQueueName);
  },
  inject: [QueueBuilder],
};
