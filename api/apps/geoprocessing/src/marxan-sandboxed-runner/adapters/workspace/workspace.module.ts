import { Module } from '@nestjs/common';

import { WorkspaceBuilder } from '../../ports/workspace-builder';
import { LinkMarxan } from './ports/link-marxan';
import { TemporaryDirectory } from './ports/temporary-directory';
import { SymlinkBinary } from './symlink-binary';
import { SharedStorage, SharedStoragePath } from './shared-storage';

import { WorkspaceService } from './workspace.service';
import { MarxanConfig } from '../../marxan-config';
import { MarxanDirectory } from '../marxan-directory.service';
import { FileReader } from '../../adapters/file-reader';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';

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
      provide: WorkspaceBuilder,
      useClass: WorkspaceService,
    },
    {
      provide: SharedStoragePath,
      useFactory: () => {
        return AppConfig.get<string>('storage.sharedFileStorage.localPath');
      },
    },
    WorkspaceService,
    FileReader,
    MarxanDirectory,
  ],
  exports: [WorkspaceBuilder],
})
export class WorkspaceModule {}
