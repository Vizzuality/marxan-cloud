import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { gcConfigToken } from './config/config.token';
import { resolveConfigProvider } from './config/factory.provider';

import { Executor } from './executor';
import { ProtectedAreasGcService } from './protected-areas-gc.service';

import { GcRunner } from './runner/gc-runner';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    {
      provide: gcConfigToken,
      useFactory: resolveConfigProvider,
    },
    {
      provide: Executor,
      useClass: GcRunner,
    },
    ProtectedAreasGcService,
  ],
})
export class ProtectedAreasGcModule {}
