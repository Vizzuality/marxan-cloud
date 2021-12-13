import { Module } from '@nestjs/common';
import { ExportApplicationModule } from './application/export-application.module';
import { ExportAdaptersModule } from './adapters/export-adapters.module';

const ExportApplication = ExportApplicationModule.for([ExportAdaptersModule]);

@Module({
  imports: [ExportApplication],
  exports: [ExportApplication],
})
export class ExportModule {}
