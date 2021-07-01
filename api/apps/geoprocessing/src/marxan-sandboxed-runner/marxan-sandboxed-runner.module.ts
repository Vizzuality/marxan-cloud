import { HttpModule, Module } from '@nestjs/common';

import { MarxanConfig } from './marxan-config';
import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';

import { WorkspaceModule } from './adapters/workspace/workspace.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';

@Module({
  imports: [
    HttpModule,
    WorkspaceModule,
    TypeOrmModule.forFeature([ScenariosOutputResultsGeoEntity]),
  ],
  providers: [MarxanConfig, MarxanSandboxRunnerService],
  exports: [MarxanSandboxRunnerService],
})
export class MarxanSandboxedRunnerModule {}
