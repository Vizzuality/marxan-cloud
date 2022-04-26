import { ApiCloningFilesRepositoryModule } from '@marxan-api/modules/cloning-file-repository/api-cloning-file-repository.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportResourcePieces } from '../application/import-resource-pieces.port';
import { ImportRepository } from '../application/import.repository.port';
import { ImportComponentLocationEntity } from './entities/import-component-locations.api.entity';
import { ImportComponentEntity } from './entities/import-components.api.entity';
import { ImportEntity } from './entities/imports.api.entity';
import { ImportResourcePiecesAdapter } from './import-resource-pieces.adapter';
import { TypeormImportRepository } from './typeorm-import.repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportEntity,
      ImportComponentEntity,
      ImportComponentLocationEntity,
    ]),
    ApiCloningFilesRepositoryModule,
  ],
  providers: [
    {
      provide: ImportRepository,
      useClass: TypeormImportRepository,
    },
    {
      provide: ImportResourcePieces,
      useClass: ImportResourcePiecesAdapter,
    },
  ],
  exports: [ImportRepository, ImportResourcePieces],
})
export class ImportAdaptersModule {}
