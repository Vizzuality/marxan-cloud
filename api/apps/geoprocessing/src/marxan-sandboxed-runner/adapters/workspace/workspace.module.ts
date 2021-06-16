import { Module } from '@nestjs/common';
import { Workspace } from '../../ports/workspace';

import { LinkMarxan } from './ports/link-marxan';
import { TemporaryDirectory } from './ports/temporary-directory';
import { SymlinkBinary } from './symlink-binary';
import { SharedStorage } from './shared-storage';

import { WorkspaceService } from './workspace.service';
import { MarxanConfig } from '../../marxan-config';

@Module({
  providers: [
    MarxanConfig,
    {
      provide: TemporaryDirectory,
      useClass: SharedStorage,
    },
    {
      provide: LinkMarxan,
      useClass: SymlinkBinary,
    },
    {
      provide: Workspace,
      useClass: WorkspaceService,
    },
    WorkspaceService,
  ],
  exports: [Workspace],
})
export class WorkspaceModule {}
