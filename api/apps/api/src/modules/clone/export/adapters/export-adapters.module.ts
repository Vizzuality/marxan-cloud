import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExportRepository } from '../application/export-repository.port';
import { ResourcePieces } from '../application/resource-pieces.port';

import { TypeormExportRepository } from './typeorm-export.repository';
import { ResourcePiecesAdapter } from './resource-pieces.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [
    {
      provide: ExportRepository,
      useClass: TypeormExportRepository,
    },
    {
      provide: ResourcePieces,
      useClass: ResourcePiecesAdapter,
    },
  ],
  exports: [ExportRepository, ResourcePieces],
})
export class ExportAdaptersModule {}
