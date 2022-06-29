import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import {
  LegacyProjectImportFilesLocalRepository,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportStoragePath,
} from '@marxan/legacy-project-import';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [
    {
      provide: LegacyProjectImportStoragePath,
      useFactory: () => {
        const path = AppConfig.get<string>(
          'storage.cloningFileStorage.localPath',
        );

        return path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      },
    },
    {
      provide: LegacyProjectImportFilesRepository,
      useClass: LegacyProjectImportFilesLocalRepository,
    },
  ],
  exports: [LegacyProjectImportFilesRepository],
})
export class GeoLegacyProjectImportFilesRepositoryModule {}
