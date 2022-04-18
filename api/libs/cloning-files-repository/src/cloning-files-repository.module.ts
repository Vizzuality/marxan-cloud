import { Module } from '@nestjs/common';
import { AppConfig } from '../../../apps/api/src/utils/config.utils';
import {
  CloningFilesRepository,
  CloningStoragePath,
} from './cloning-files.repository';
import { VolumeCloningFilesStorage } from './volume-cloning-files.repository';

@Module({
  imports: [],
  providers: [
    {
      provide: CloningStoragePath,
      useValue: AppConfig.get<string>('storage.cloningFileStorage.localPath'),
    },
    {
      provide: CloningFilesRepository,
      useClass: VolumeCloningFilesStorage,
    },
  ],
  exports: [CloningFilesRepository],
})
export class CloningFileSRepositoryModule {}
