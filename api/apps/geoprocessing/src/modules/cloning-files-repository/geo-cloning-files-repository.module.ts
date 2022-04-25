import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import {
  CloningFileProvider,
  CloningStoragePath,
} from '@marxan/cloning-files-repository';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [
    {
      provide: CloningStoragePath,
      useValue: AppConfig.get<string>('storage.cloningFileStorage.localPath'),
    },
    CloningFileProvider,
  ],
  exports: [CloningFileProvider],
})
export class GeoCloningFilesRepositoryModule {}
