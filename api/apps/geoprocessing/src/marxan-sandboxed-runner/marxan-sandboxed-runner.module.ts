import { Module } from '@nestjs/common';

import { MarxanConfig } from './marxan-config';
import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';

import { DeriveScenarioDataModule } from './adapters/scenario-data/derive-scenario-data.module';
import { SolutionOutputModule } from './adapters/solutions-output/solution-output.module';
import { WorkspaceModule } from './adapters/workspace/workspace.module';

import { MarxanRun } from './marxan-run';

@Module({
  imports: [DeriveScenarioDataModule, SolutionOutputModule, WorkspaceModule],
  providers: [MarxanConfig, MarxanSandboxRunnerService, MarxanRun],
  exports: [MarxanSandboxRunnerService],
})
export class MarxanSandboxedRunnerModule {}
