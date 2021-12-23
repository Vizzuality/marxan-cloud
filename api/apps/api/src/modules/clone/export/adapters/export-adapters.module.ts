import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRepositoryModule } from '@marxan/files-repository';

import { ExportRepository } from '../application/export-repository.port';
import { ResourcePieces } from '../application/resource-pieces.port';
import { ArchiveCreator } from '../application/archive-creator.port';

import { TypeormExportRepository } from './typeorm-export.repository';
import { ResourcePiecesAdapter } from './resource-pieces.adapter';
import { InMemoryExportRepo } from './in-memory-export.repository';
import { NodeArchiveCreator } from './node-archive-creator';

@Module({
  imports: [FileRepositoryModule, TypeOrmModule.forFeature([])],
  providers: [
    {
      provide: ExportRepository,
      useClass: InMemoryExportRepo, // TODO TypeormExportRepository
    },
    {
      provide: ResourcePieces,
      useClass: ResourcePiecesAdapter,
    },
    {
      provide: ArchiveCreator,
      useClass: NodeArchiveCreator,
    },
  ],
  exports: [ExportRepository, ResourcePieces, ArchiveCreator],
})
export class ExportAdaptersModule {}
