import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { FileRepositoryModule } from '@marxan/files-repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchiveCreator } from '../application/archive-creator.port';
import { ExportRepository } from '../application/export-repository.port';
import { ResourcePieces } from '../application/resource-pieces.port';
import { InMemoryExportRepo } from './in-memory-export.repository';
import { NodeArchiveCreator } from './node-archive-creator';
import { ResourcePiecesAdapter } from './resource-pieces.adapter';
import { ProjectResourcePiecesAdapter } from './resource-pieces/project-resource-pieces.adapter';
import { ScenarioResourcePiecesAdapter } from './resource-pieces/scenario-resource-pieces.adapter';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([]),
    DiscoveryModule,
  ],
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
    ProjectResourcePiecesAdapter,
    ScenarioResourcePiecesAdapter,
  ],
  exports: [ExportRepository, ResourcePieces, ArchiveCreator],
})
export class ExportAdaptersModule {}
