import { Module } from '@nestjs/common';
import { LegacyProjectImportInfraModule } from './infra/legacy-project-import.infra.module';

@Module({
  imports: [LegacyProjectImportInfraModule],
})
export class LegacyProjectImportModule {}
