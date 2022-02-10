import { Module } from '@nestjs/common';

import { ExportModule } from './export';
import { ImportModule } from './import/import.module';
import { ExportInfraModule } from './infra/export/export.infra.module';

@Module({
  imports: [ExportInfraModule, ImportModule, ExportModule],
  exports: [ExportModule, ImportModule],
})
export class CloneModule {}
