import { Module, Provider } from '@nestjs/common';
import { AppConfig } from '../../../apps/api/src/utils/config.utils';
import {
  CloningFilesRepository,
  CloningStoragePath,
} from './cloning-files.repository';
import { LocalCloningFilesStorage } from './local-cloning-files.repository';

export const CloningFileProvider: Provider = {
  provide: CloningFilesRepository,
  useClass: VolumeCloningFilesStorage,
};
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
    {
      provide: CloningFilesRepository,
      useClass: LocalCloningFilesStorage,
    },
  ],
  exports: [CloningFilesRepository],
})
export class CloningFileSRepositoryModule {}
