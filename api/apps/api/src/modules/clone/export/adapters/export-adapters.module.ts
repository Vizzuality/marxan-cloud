import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { FileRepositoryModule } from '@marxan/files-repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '../../../scenarios/scenario.api.entity';
import { ArchiveCreator } from '../application/archive-creator.port';
import { ExportRepository } from '../application/export-repository.port';
import { ResourcePieces } from '../application/resource-pieces.port';
import { ComponentLocationEntity } from './entities/component-locations.api.entity';
import { ExportComponentEntity } from './entities/export-components.api.entity';
import { ExportEntity } from './entities/exports.api.entity';
import { NodeArchiveCreator } from './node-archive-creator';
import { ResourcePiecesAdapter } from './resource-pieces.adapter';
import { ProjectResourcePiecesAdapter } from './resource-pieces/project-resource-pieces.adapter';
import { ScenarioResourcePiecesAdapter } from './resource-pieces/scenario-resource-pieces.adapter';
import { TypeormExportRepository } from './typeorm-export.repository';

@Module({
  imports: [
    FileRepositoryModule,
    DiscoveryModule,
    TypeOrmModule.forFeature([
      Scenario,
      ExportEntity,
      ExportComponentEntity,
      ComponentLocationEntity,
    ]),
  ],
  providers: [
    {
      provide: ExportRepository,
      useClass: TypeormExportRepository,
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
