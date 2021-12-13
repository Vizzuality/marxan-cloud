import { ValueProvider } from '@nestjs/common';
import { queueName as scenarioRunQueueName } from '@marxan/scenario-run-queue';
import { runWorkerQueueNameToken } from '../tokens';

export const runWorkerQueueNameProvider: ValueProvider<string> = {
  provide: runWorkerQueueNameToken,
  useValue: scenarioRunQueueName,
};
