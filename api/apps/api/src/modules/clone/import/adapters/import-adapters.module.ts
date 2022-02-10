import { FileRepositoryModule } from '@marxan/files-repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchiveReader } from '../application/archive-reader.port';
import { ImportRepository } from '../application/import.repository.port';
import { ArchiveReaderAdapter } from './archive-reader.adapter';
import { ImportComponentLocationEntity } from './entities/import-component-locations.api.entity';
import { ImportComponentEntity } from './entities/import-components.api.entity';
import { ImportEntity } from './entities/imports.api.entity';
import { TypeormImportRepository } from './typeorm-import.repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportEntity,
      ImportComponentEntity,
      ImportComponentLocationEntity,
    ]),
    FileRepositoryModule,
  ],
  providers: [
    {
      provide: ImportRepository,
      useClass: TypeormImportRepository,
    },
    {
      provide: ArchiveReader,
      useClass: ArchiveReaderAdapter,
    },
  ],
  exports: [ArchiveReader, ImportRepository],
})
export class ImportAdaptersModule {}
