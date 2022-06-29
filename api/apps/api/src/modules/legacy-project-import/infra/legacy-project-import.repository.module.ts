import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportComponentEntity } from './entities/legacy-project-import-component.api.entity';
import { LegacyProjectImportFileEntity } from './entities/legacy-project-import-file.api.entity';
import { LegacyProjectImportEntity } from './entities/legacy-project-import.api.entity';
import { LegacyProjectImportTypeormRepository } from './legacy-project-import-typeorm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LegacyProjectImportEntity,
      LegacyProjectImportComponentEntity,
      LegacyProjectImportFileEntity,
    ]),
  ],
  providers: [
    {
      provide: LegacyProjectImportRepository,
      useClass: LegacyProjectImportTypeormRepository,
    },
  ],
  exports: [LegacyProjectImportRepository],
})
export class LegacyProjectImportRepositoryModule {}
