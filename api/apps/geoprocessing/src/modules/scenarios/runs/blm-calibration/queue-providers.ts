import { ValueProvider } from '@nestjs/common';
import { blmCalibrationQueueName } from '@marxan/blm-calibration';
import { runWorkerQueueNameToken } from '../tokens';

export const runWorkerQueueNameProvider: ValueProvider<string> = {
  provide: runWorkerQueueNameToken,
  useValue: blmCalibrationQueueName,
};
