import { Module } from '@nestjs/common';
import { LegacyProjectImportApplicationModule } from './application/legacy-project-import.application.module';
import { LegacyProjectImportInfraModule } from './infra/legacy-project-import.infra.module';

@Module({
  imports: [
    LegacyProjectImportInfraModule,
    LegacyProjectImportApplicationModule,
  ],
})
export class LegacyProjectImportModule {}
