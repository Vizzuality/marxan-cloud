import { CloningFileSRepositoryModule } from '@marxan/cloning-files-repository';
import { Module } from '@nestjs/common';
import { ExportAdaptersModule } from './adapters/export-adapters.module';
import { ExportApplicationModule } from './application/export-application.module';

const ExportApplication = ExportApplicationModule.for([
  ExportAdaptersModule,
  CloningFileSRepositoryModule,
]);

@Module({
  imports: [ExportApplication],
  exports: [ExportApplication],
})
export class ExportModule {}
