import { HttpModule, Module } from '@nestjs/common';
import { MarxanConfig } from './marxan-config';
import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';

import { WorkspaceModule } from './adapters/workspace/workspace.module';
import { MarxanDirectory } from './adapters/marxan-directory.service';
import { GeoOutputModule } from './adapters/solutions-output/geo-output/geo-output.module';
import { FileReader } from './adapters/file-reader';
import { AssetFetcher } from './adapters/scenario-data/asset-fetcher';
import { FetchConfig } from './adapters/scenario-data/fetch.config';
import { SolutionsOutputModule } from './adapters/solutions-output/solutions-output.module';

@Module({
  imports: [
    HttpModule,
    WorkspaceModule,
    GeoOutputModule,
    SolutionsOutputModule,
  ],
  providers: [
    MarxanConfig,
    MarxanSandboxRunnerService,
    AssetFetcher,
    FetchConfig,
    MarxanDirectory,
    FileReader,
  ],
  exports: [MarxanSandboxRunnerService],
})
export class MarxanSandboxedRunnerModule {}
