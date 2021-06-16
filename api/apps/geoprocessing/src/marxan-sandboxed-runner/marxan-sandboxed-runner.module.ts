import { Module } from '@nestjs/common';

import { MarxanConfig } from './marxan-config';
import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';
import { MarxanRunner } from './ports/marxan-runner';

import { DeriveScenarioDataModule } from './adapters/scenario-data/derive-scenario-data.module';
import { SolutionOutputModule } from './adapters/solutions-output/solution-output.module';
import { MarxanSubprocess } from './adapters/marxan-subprocess';
import { WorkspaceModule } from './adapters/workspace/workspace.module';

@Module({
  imports: [DeriveScenarioDataModule, SolutionOutputModule, WorkspaceModule],
  providers: [
    MarxanConfig,
    MarxanSandboxRunnerService,
    {
      provide: MarxanRunner,
      useClass: MarxanSubprocess,
    },
  ],
  exports: [MarxanSandboxRunnerService],
})
export class MarxanSandboxedRunnerModule {}
