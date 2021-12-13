import { HttpModule, Module } from '@nestjs/common';

import { MarxanConfig } from '../marxan-config';

// ports
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';
import { SandboxRunnerInputFiles } from '../sandbox-runner-input-files';

// adapters
import { WorkspaceModule } from '../adapters-shared/workspace/workspace.module';

import { SolutionsOutputModule } from './solutions-output/solutions-output.module';
import { SolutionsOutputService } from './solutions-output/solutions-output.service';
import { InputFilesFs } from './scenario-data/input-files-fs';
import { FileReader } from './file-reader';
import { MarxanDirectory } from './marxan-directory.service';
import { FetchConfig } from '../adapters-shared/assets/fetch.config';
import { AssetFetcher } from '../adapters-shared/assets/asset-fetcher';
import { GeoOutputModule } from './solutions-output/geo-output';
import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';
import { sandboxRunnerToken } from '@marxan-geoprocessing/modules/scenarios/runs/tokens';

@Module({
  imports: [
    HttpModule,
    WorkspaceModule,
    GeoOutputModule,
    SolutionsOutputModule,
  ],
  providers: [
    MarxanConfig,
    {
      provide: sandboxRunnerToken,
      useClass: MarxanSandboxRunnerService,
    },
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
  exports: [sandboxRunnerToken],
})
export class SingleRunAdapterModule {}
