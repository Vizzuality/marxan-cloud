import { HttpModule, Module } from '@nestjs/common';
import { MarxanConfig } from './marxan-config';

import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';
import { SandboxRunnerOutputHandler } from './sandbox-runner-output-handler';
import { SandboxRunnerInputFiles } from './sandbox-runner-input-files';

import { WorkspaceModule } from './adapters/workspace/workspace.module';
import { MarxanDirectory } from './adapters/marxan-directory.service';
import { GeoOutputModule } from './adapters/solutions-output/geo-output/geo-output.module';
import { FileReader } from './adapters/file-reader';
import { AssetFetcher } from './adapters/scenario-data/asset-fetcher';
import { FetchConfig } from './adapters/scenario-data/fetch.config';
import { SolutionsOutputModule } from './adapters/solutions-output/solutions-output.module';
import { InputFilesFs } from './adapters/scenario-data/input-files-fs';
import { SolutionsOutputService } from './adapters/solutions-output/solutions-output.service';

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
    {
      provide: SandboxRunnerInputFiles,
      useClass: InputFilesFs,
    },
    {
      provide: SandboxRunnerOutputHandler,
      useClass: SolutionsOutputService,
    },
  ],
  exports: [MarxanSandboxRunnerService],
})
/**
 * make it dynamic module to be able to provide different set of adapters
 * for blm / single run
 */
export class MarxanSandboxedRunnerModule {}
