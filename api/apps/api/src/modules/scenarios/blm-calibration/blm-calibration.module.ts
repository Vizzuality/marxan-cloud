import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';

import { StartBlmCalibrationHandler } from './start-blm-calibration.handler';
import {
  calibrationQueueEventsFactoryProvider,
  calibrationQueueEventsProvider,
  calibrationQueueProvider,
} from './blm-calibration-queue.providers';
import { apiUrlProvider, AssetsService } from '../marxan-run/assets.service';
import { InputFilesModule } from '../input-files';
import { BlmCalibrationEventsService } from './blm-calibration-events.service';
import { CancelBlmCalibrationHandler } from './cancel-blm-calibration.handler';
import { ScenarioJobService } from '../scenario-job/scenario-job.service';
import { CreateInitialBlmHandler } from '@marxan-api/modules/scenarios/blm-calibration/create-initial-blm.handler';
import { BlmValuesModule } from '@marxan-api/modules/blm';
import { ChangeScenarioBlmRangeHandler } from '@marxan-api/modules/scenarios/blm-calibration/change-scenario-blm-range.handler';
import { BlmValuesPolicyFactory } from '@marxan-api/modules/projects/blm/blm-values-policy-factory';

@Module({
  imports: [
    InputFilesModule,
    ApiEventsModule,
    QueueApiEventsModule,
    BlmValuesModule,
    CqrsModule,
  ],
  providers: [
    BlmValuesPolicyFactory,
    StartBlmCalibrationHandler,
    CancelBlmCalibrationHandler,
    CreateInitialBlmHandler,
    ChangeScenarioBlmRangeHandler,
    calibrationQueueProvider,
    calibrationQueueEventsProvider,
    calibrationQueueEventsFactoryProvider,
    AssetsService,
    apiUrlProvider,
    BlmCalibrationEventsService,
    ScenarioJobService,
  ],
  exports: [],
})
export class BlmCalibrationModule {}
