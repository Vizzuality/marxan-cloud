import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';
import { MarxanConfig } from './marxan-config';
import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';

import { WorkspaceModule } from './adapters/workspace/workspace.module';
import { AssetFetcher } from './adapters/scenario-data/asset-fetcher';
import { FetchConfig } from './adapters/scenario-data/fetch.config';

@Module({
  imports: [
    HttpModule,
    WorkspaceModule,
    TypeOrmModule.forFeature([ScenariosOutputResultsGeoEntity]),
  ],
  providers: [
    MarxanConfig,
    MarxanSandboxRunnerService,
    AssetFetcher,
    FetchConfig,
  ],
  exports: [MarxanSandboxRunnerService],
})
export class MarxanSandboxedRunnerModule {}
