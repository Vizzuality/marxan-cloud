import { Provider } from '@nestjs/common';
import { CloningFilesRepository } from './cloning-files.repository';
import { LocalCloningFilesStorage } from './local-cloning-files.repository';

export const CloningFilesRepositoryProvider: Provider = {
  provide: CloningFilesRepository,
  useClass: LocalCloningFilesStorage,
};
