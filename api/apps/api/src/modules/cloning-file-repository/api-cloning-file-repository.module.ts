import { AppConfig } from '@marxan-api/utils/config.utils';
import {
  CloningFilesRepositoryProvider,
  CloningStoragePath,
} from '@marxan/cloning-files-repository';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [
    {
      provide: CloningStoragePath,
      useFactory: () => {
        const path = AppConfig.get<string>(
          'storage.cloningFileStorage.localPath',
        );

        return path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      },
    },
    CloningFilesRepositoryProvider,
  ],
  exports: [CloningFilesRepositoryProvider],
})
export class ApiCloningFilesRepositoryModule {}
