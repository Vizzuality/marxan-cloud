import { ApiCloningFilesRepositoryModule } from '@marxan-api/modules/cloning-file-repository/api-cloning-file-repository.module';
import { Module } from '@nestjs/common';
import { ExportAdaptersModule } from './adapters/export-adapters.module';
import { ExportApplicationModule } from './application/export-application.module';

const ExportApplication = ExportApplicationModule.for([
  ExportAdaptersModule,
  ApiCloningFilesRepositoryModule,
]);

@Module({
  imports: [ExportApplication],
  exports: [ExportApplication],
})
export class ExportModule {}
