import { QueueBuilder } from '@marxan-api/modules/queue';
import {
  failedImportDbCleanupQueueName,
  ImportJobInput,
} from '@marxan/cloning';
import { FactoryProvider } from '@nestjs/common';
import { Queue } from 'bullmq';

export const failedImportDbCleanupQueueToken = Symbol(
  'failed import db cleanup queue token',
);

export const failedImportDbCleanupQueueProvider: FactoryProvider<
  Queue<ImportJobInput>
> = {
  provide: failedImportDbCleanupQueueToken,
  useFactory: (queueBuilder: QueueBuilder<ImportJobInput>) => {
    return queueBuilder.buildQueue(failedImportDbCleanupQueueName);
  },
  inject: [QueueBuilder],
};
