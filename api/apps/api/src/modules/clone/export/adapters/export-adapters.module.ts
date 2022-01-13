import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRepositoryModule } from '@marxan/files-repository';

import { ExportRepository } from '../application/export-repository.port';
import { ResourcePieces } from '../application/resource-pieces.port';
import { ArchiveCreator } from '../application/archive-creator.port';
import { ResourcePiecesAdapter } from './resource-pieces.adapter';
import { NodeArchiveCreator } from './node-archive-creator';
import { TypeormExportRepository } from '@marxan-api/modules/clone/export/adapters/typeorm-export.repository';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import { ExportComponentEntity } from '@marxan-api/modules/clone/export/adapters/entities/export-components.api.entity';
import { ComponentLocationEntity } from '@marxan-api/modules/clone/export/adapters/entities/component-locations.api.entity';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([
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
  ],
  exports: [ExportRepository, ResourcePieces, ArchiveCreator],
})
export class ExportAdaptersModule {}
