import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { QueueModule } from '@marxan-api/modules/queue';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZipFilesSerializer } from '../dto/zip-files.serializer';
import { InputFilesModule } from '../input-files';
import { OutputFilesModule } from '../output-files/output-files.module';
import { ScenarioJobService } from '../scenario-job/scenario-job.service';
import { Scenario } from '../scenario.api.entity';
import { apiUrlProvider, AssetsService } from './assets.service';
import { CancelHandler } from './cancel.handler';
import { EventsHandler } from './events.handler';
import { MarxanRunController } from './marxan-run.controller';
import { OutputRepository } from './output.repository';
import {
  blmDefaultProvider,
  runQueueEventsProvider,
  runQueueProvider,
} from './run-service.providers';
import { RunHandler } from './run.handler';
import { RunService } from './run.service';

@Module({
  imports: [
    QueueModule.register(),
    ApiEventsModule,
    TypeOrmModule.forFeature([Scenario, ScenariosOutputResultsApiEntity]),
    InputFilesModule,
    OutputFilesModule,
  ],
  providers: [
    RunHandler,
    CancelHandler,
    EventsHandler,
    runQueueProvider,
    runQueueEventsProvider,
    blmDefaultProvider,
    RunService,
    AssetsService,
    apiUrlProvider,
    OutputRepository,
    ScenarioJobService,
    ZipFilesSerializer,
  ],
  controllers: [MarxanRunController],
  exports: [RunService],
})
export class MarxanRunModule {}
