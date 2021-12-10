import { Module } from '@nestjs/common';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import { MarxanRunController } from './marxan-run.controller';
import { RunService } from './run.service';
import { apiUrlProvider, AssetsService } from './assets.service';
import { QueueModule } from '@marxan-api/modules/queue';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '../scenario.api.entity';
import { InputFilesModule } from '../input-files';
import {
  blmDefaultProvider,
  calibrationQueueEventsProvider,
  calibrationQueueProvider,
  runQueueEventsProvider,
  runQueueProvider,
} from './run-service.providers';
import { RunHandler } from './run.handler';
import { CancelHandler } from './cancel.handler';
import { EventsHandler } from './events.handler';
import { OutputRepository } from './output.repository';

@Module({
  imports: [
    QueueModule.register(),
    ApiEventsModule,
    TypeOrmModule.forFeature([Scenario, ScenariosOutputResultsApiEntity]),
    InputFilesModule,
  ],
  providers: [
    RunHandler,
    CancelHandler,
    EventsHandler,
    runQueueProvider,
    runQueueEventsProvider,
    calibrationQueueProvider,
    calibrationQueueEventsProvider,
    blmDefaultProvider,
    RunService,
    AssetsService,
    apiUrlProvider,
    OutputRepository,
  ],
  controllers: [MarxanRunController],
  exports: [RunService],
})
export class MarxanRunModule {}
