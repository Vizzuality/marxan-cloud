import { Module } from '@nestjs/common';

import { MarxanConfig } from './marxan-config';
import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';

import { TemporaryDirectory } from './ports/temporary-directory';
import { LinkMarxan } from './ports/link-marxan';
import { InputFiles } from './ports/input-files';

import { SharedStorage } from './adapters/shared-storage';
import { SymlinkBinary } from './adapters/symlink-binary';
import { CreateInputFiles } from './adapters/create-input-files';

@Module({
  providers: [
    MarxanConfig,
    MarxanSandboxRunnerService,
    {
      provide: TemporaryDirectory,
      useClass: SharedStorage,
    },
    {
      provide: LinkMarxan,
      useClass: SymlinkBinary,
    },
    {
      provide: InputFiles,
      useClass: CreateInputFiles,
    },
  ],
  exports: [MarxanSandboxRunnerService],
})
export class MarxanSandboxedRunnerModule {}
