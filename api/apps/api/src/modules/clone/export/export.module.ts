import { FileRepositoryModule } from '@marxan/files-repository';
import { Module } from '@nestjs/common';
import { ExportAdaptersModule } from './adapters/export-adapters.module';
import { ExportApplicationModule } from './application/export-application.module';

const ExportApplication = ExportApplicationModule.for([
  ExportAdaptersModule,
  FileRepositoryModule,
]);

@Module({
  imports: [ExportApplication],
  exports: [ExportApplication],
})
export class ExportModule {}
