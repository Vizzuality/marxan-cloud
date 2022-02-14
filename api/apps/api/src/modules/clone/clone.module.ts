import { Module } from '@nestjs/common';
import { ExportModule } from './export';
import { ImportModule } from './import/import.module';
import { ExportInfraModule } from './infra/export/export.infra.module';
import { ImportInfraModule } from './infra/import/import.infra.module';

@Module({
  imports: [ExportInfraModule, ExportModule, ImportInfraModule, ImportModule],
  exports: [ExportModule, ImportModule],
})
export class CloneModule {}
