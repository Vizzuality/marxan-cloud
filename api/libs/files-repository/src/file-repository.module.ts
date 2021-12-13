import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FileRepository } from './file.repository';
import { validate } from './file-repo.config';
import { TempStorageRepository } from './temp-storage.repository';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      validate,
    }),
  ],
  providers: [
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
