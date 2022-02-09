import { Module } from '@nestjs/common';
import { ImportRepository } from '@marxan-api/modules/clone/import/application/import-repository/import.repository.port';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportEntity } from './entities/imports.api.entity';
import { ImportComponentEntity } from './entities/import-components.api.entity';
import { ImportComponentLocationEntity } from './entities/component-locations.api.entity';
import { TypeormImportRepository } from './typeorm-import.repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportEntity,
      ImportComponentEntity,
      ImportComponentLocationEntity,
    ]),
  ],
  providers: [
    {
      useClass: TypeormImportRepository,
      provide: ImportRepository,
    },
  ],
  exports: [ImportRepository],
})
export class ImportRepositoryModule {}
