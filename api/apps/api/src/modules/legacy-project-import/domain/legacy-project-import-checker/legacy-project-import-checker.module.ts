import { Module } from '@nestjs/common';
import { LegacyProjectImportRepositoryModule } from '../../infra/legacy-project-import.repository.module';
import { LegacyProjectImportChecker } from './legacy-project-import-checker.service';
import { MarxanLegacyProjectImportChecker } from './marxan-legacy-project-import-checker.service';

@Module({
  imports: [LegacyProjectImportRepositoryModule],
  providers: [
    {
      provide: LegacyProjectImportChecker,
      useClass: MarxanLegacyProjectImportChecker,
    },
  ],
  exports: [LegacyProjectImportChecker],
})
export class LegacyProjectImportCheckerModule {}
