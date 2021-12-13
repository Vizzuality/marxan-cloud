import { Module } from '@nestjs/common';

import { ImportModule } from './import';
import { ExportModule } from './export';
import { ExportInfraModule } from './infra/export/export.infra.module';

@Module({
  imports: [ExportInfraModule, ImportModule, ExportModule],
  exports: [ExportModule, ImportModule],
})
export class CloneModule {}
