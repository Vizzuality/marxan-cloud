import { Module } from '@nestjs/common';

import { MarxanConfig } from '../marxan-config';

// ports
import { sandboxRunnerToken } from '@marxan-geoprocessing/modules/scenarios/runs/tokens';

// adapters
import { WorkspaceModule } from '../adapters-shared/workspace/workspace.module';

import { MarxanSandboxBlmRunnerService } from './marxan-sandbox-blm-runner.service';
import { BlmInputFiles } from './blm-input-files';
import { AssetFactory } from './asset-factory.service';

import { InputFilesFs } from '../adapters-single/scenario-data/input-files-fs';
import { AssetsModule } from '../adapters-shared';
import {
  BlmFinalResultsRepository,
  blmFinalResultsRepository,
} from './blm-final-results.repository';
import {
  BlmPartialResultsRepository,
  blmPartialResultsRepository,
} from './blm-partial-results.repository';

export const blmSandboxRunner = Symbol(`blm sandbox runner`);

@Module({
  imports: [WorkspaceModule, AssetsModule],
  providers: [
    MarxanConfig,
    {
      provide: sandboxRunnerToken,
      useClass: MarxanSandboxBlmRunnerService,
    },
    {
      provide: blmSandboxRunner,
      useClass: MarxanSandboxBlmRunnerService,
    },
    {
      provide: blmFinalResultsRepository,
      useClass: BlmFinalResultsRepository,
    },
    {
      provide: blmPartialResultsRepository,
      useClass: BlmPartialResultsRepository,
    },
    AssetFactory,
    BlmInputFiles,
    InputFilesFs,
  ],
  exports: [sandboxRunnerToken, blmSandboxRunner],
})
export class BlmRunAdapterModule {}
