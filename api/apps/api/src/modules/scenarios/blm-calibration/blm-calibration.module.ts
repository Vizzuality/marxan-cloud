import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';

import { StartBlmCalibrationHandler } from './start-blm-calibration.handler';
import {
  calibrationQueueEventsProvider,
  calibrationQueueProvider,
} from './blm-calibration-queue.providers';
import { apiUrlProvider, AssetsService } from '../marxan-run/assets.service';

@Module({
  imports: [ApiEventsModule, QueueApiEventsModule, CqrsModule],
  providers: [
    StartBlmCalibrationHandler,
    calibrationQueueProvider,
    calibrationQueueEventsProvider,
    AssetsService,
    apiUrlProvider,
  ],
  exports: [],
})
export class BlmCalibrationModule {}
