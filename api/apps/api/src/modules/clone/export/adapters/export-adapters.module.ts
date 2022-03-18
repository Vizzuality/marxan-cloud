import { FileRepositoryModule } from '@marxan/files-repository';
import { ConsoleLogger, Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../../projects/project.api.entity';
import { ArchiveCreator } from '../application/archive-creator.port';
import { ExportRepository } from '../application/export-repository.port';
import { ExportResourcePieces } from '../application/export-resource-pieces.port';
import { ExportComponentLocationEntity } from './entities/export-component-locations.api.entity';
import { ExportComponentEntity } from './entities/export-components.api.entity';
import { ExportEntity } from './entities/exports.api.entity';
import { ExportResourcePiecesAdapter } from './export-resource-pieces.adapter';
import { NodeArchiveCreator } from './node-archive-creator';
import { TypeormExportRepository } from './typeorm-export.repository';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([
      Project,
      ExportEntity,
      ExportComponentEntity,
      ExportComponentLocationEntity,
    ]),
  ],
  providers: [
    {
      provide: ExportRepository,
      useClass: TypeormExportRepository,
    },
    {
      provide: ExportResourcePieces,
      useClass: ExportResourcePiecesAdapter,
    },
    {
      provide: ArchiveCreator,
      useClass: NodeArchiveCreator,
    },
    {
      provide: ConsoleLogger,
      useClass: ConsoleLogger,
      scope: Scope.TRANSIENT,
    }
  ],
  exports: [ExportRepository, ExportResourcePieces, ArchiveCreator],
})
export class ExportAdaptersModule {}
