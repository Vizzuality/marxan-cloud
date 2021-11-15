import { Module } from '@nestjs/common';

import { MarxanConfig } from '../marxan-config';

// ports
import { SandboxRunner } from '../sandbox-runner';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';
import { SandboxRunnerInputFiles } from '../sandbox-runner-input-files';

// adapters
import { WorkspaceModule } from '../adapters-shared/workspace/workspace.module';

import { MarxanSandboxBlmRunnerService } from './marxan-sandbox-blm-runner.service';

@Module({
  imports: [WorkspaceModule],
  providers: [
    MarxanConfig,
    {
      provide: SandboxRunner,
      useClass: MarxanSandboxBlmRunnerService,
    },

    {
      provide: SandboxRunnerInputFiles,
      useValue: {},
    },
    {
      provide: SandboxRunnerOutputHandler,
      useValue: {},
    },
  ],
  exports: [SandboxRunner],
})
export class BlmRunAdapterModule {}
