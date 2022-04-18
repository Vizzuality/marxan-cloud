import { Module } from '@nestjs/common';
import { AppConfig } from '../../../apps/api/src/utils/config.utils';
import { CloningStoragePath, FileRepository } from './file.repository';
import { TempStorageRepository } from './temp-storage.repository';

@Module({
  imports: [],
  providers: [
    {
      provide: CloningStoragePath,
      useValue: AppConfig.get<string>('storage.cloningFileStorage.localPath'),
    },
    {
      provide: FileRepository,
      /**
       * Temporary override in lib core - to avoid overrides in each application.
       * Once actual `FileRepository` is implemented, should be removed.
       */
      useClass: TempStorageRepository,
    },
  ],
  exports: [FileRepository],
})
export class FileRepositoryModule {}
