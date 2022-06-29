import { QueueBuilder } from '@marxan-api/modules/queue';
import {
  FailedLegacyProjectImportDbCleanupJobInput,
  FailedLegacyProjectImportDbCleanupJobOutput,
  failedLegacyProjectImportDbCleanupQueueName,
} from '@marxan/legacy-project-import';
import { FactoryProvider } from '@nestjs/common';
import { Queue } from 'bullmq';

export const failedLegacyProjectImportDbCleanupQueueToken = Symbol(
  'failed legacy project import db cleanup queue token',
);

export const failedLegacyProjectImportDbCleanupQueueProvider: FactoryProvider<
  Queue<
    FailedLegacyProjectImportDbCleanupJobInput,
    FailedLegacyProjectImportDbCleanupJobOutput
  >
> = {
  provide: failedLegacyProjectImportDbCleanupQueueToken,
  useFactory: (
    queueBuilder: QueueBuilder<
      FailedLegacyProjectImportDbCleanupJobInput,
      FailedLegacyProjectImportDbCleanupJobOutput
    >,
  ) => {
    return queueBuilder.buildQueue(failedLegacyProjectImportDbCleanupQueueName);
  },
  inject: [QueueBuilder],
};
