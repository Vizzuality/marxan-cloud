import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportComponentEntity } from '../infra/entities/legacy-project-import-component.api.entity';
import { LegacyProjectImportFileEntity } from '../infra/entities/legacy-project-import-file.api.entity';
import { LegacyProjectImportEntity } from '../infra/entities/legacy-project-import.api.entity';
import { LegacyProjectImportTypeormRepository } from '../infra/legacy-project-import-typeorm.repository';

@Module({
  imports: [
    CqrsModule,
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
})
export class LegacyProjectImportApplicationModule {}
