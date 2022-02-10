import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportRepository } from '../application/import.repository.port';
import { TypeormImportRepository } from './typeorm-import.repository.adapter';
import { ImportComponentLocationEntity } from './entities/import-component-locations.api.entity';
import { ImportComponentEntity } from './entities/import-components.api.entity';
import { ImportEntity } from './entities/imports.api.entity';
import { FakeArchiveReader } from './fake-archive-reader.adapter';
import { ArchiveReader } from '../application/archive-reader.port';
import { FileRepositoryModule } from '@marxan/files-repository';

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
      useClass: FakeArchiveReader,
    },
  ],
  exports: [],
})
export class ImportAdaptersModule {}
