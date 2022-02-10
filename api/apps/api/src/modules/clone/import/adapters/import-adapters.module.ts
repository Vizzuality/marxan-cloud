import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportRepository } from '../application/import.repository.port';
import { TypeormImportRepository } from './typeorm-import.repository.adapter';
import { ImportComponentLocationEntity } from './entities/import-component-locations.api.entity';
import { ImportComponentEntity } from './entities/import-components.api.entity';
import { ImportEntity } from './entities/imports.api.entity';

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
      provide: ImportRepository,
      useClass: TypeormImportRepository,
    },
  ],
  exports: [],
})
export class ImportAdaptersModule {}
