import { Module } from '@nestjs/common';
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
  runQueueEventsProvider,
  runQueueProvider,
} from './run-service.providers';

@Module({
  imports: [
    QueueModule.register(),
    ApiEventsModule,
    TypeOrmModule.forFeature([Scenario]),
    InputFilesModule,
  ],
  providers: [
    runQueueProvider,
    runQueueEventsProvider,
    blmDefaultProvider,
    RunService,
    AssetsService,
    apiUrlProvider,
  ],
  controllers: [MarxanRunController],
  exports: [RunService],
})
export class MarxanRunModule {}
