import { Module } from '@nestjs/common';
import { MarxanRunController } from './marxan-run.controller';
import { MarxanFilesService } from './marxan-files.service';
import {
  runQueueEventsProvider,
  runQueueProvider,
  RunService,
} from './run.service';
import { apiUrlProvider, AssetsService } from './assets.service';
import { ioSettingsProvider } from './io-settings';
import { InputParameterFileProvider } from './input-parameter-file.provider';
import { QueueModule } from '@marxan-api/modules/queue';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '../scenario.api.entity';
import { CostSurfaceViewModule } from '../cost-surface-readmodel/cost-surface-view.module';
import { SpecDatModule } from '@marxan-api/modules/scenarios/input-files/spec.dat.module';
import { PuvsprDatModule } from '@marxan-api/modules/scenarios/input-files/puvspr.dat.module';
import { BoundDatModule } from '@marxan-api/modules/scenarios/input-files/bound.dat.module';

@Module({
  imports: [
    QueueModule.register(),
    ApiEventsModule,
    TypeOrmModule.forFeature([Scenario]),
    CostSurfaceViewModule,
    SpecDatModule,
    PuvsprDatModule,
    BoundDatModule,
  ],
  providers: [
    MarxanFilesService,
    runQueueProvider,
    runQueueEventsProvider,
    RunService,
    AssetsService,
    ioSettingsProvider,
    apiUrlProvider,
    InputParameterFileProvider,
  ],
  controllers: [MarxanRunController],
  exports: [RunService, InputParameterFileProvider],
})
export class MarxanRunModule {}
