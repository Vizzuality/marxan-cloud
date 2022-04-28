import { ApiCloningFilesRepositoryModule } from '@marxan-api/modules/cloning-file-repository/api-cloning-file-repository.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../../../../utils/config.utils';
import { Project } from '../../../projects/project.api.entity';
import { ArchiveCreator } from '../application/archive-creator.port';
import { ExportRepository } from '../application/export-repository.port';
import { ExportResourcePieces } from '../application/export-resource-pieces.port';
import {
  CloningSigningSecret,
  ManifestFileService,
} from '../application/manifest-file-service.port';
import { ExportComponentLocationEntity } from './entities/export-component-locations.api.entity';
import { ExportComponentEntity } from './entities/export-components.api.entity';
import { ExportEntity } from './entities/exports.api.entity';
import { ExportResourcePiecesAdapter } from './export-resource-pieces.adapter';
import { NodeArchiveCreator } from './node-archive-creator';
import { NodeManifestFileService } from './node-manifest-file-service.adapter';
import { TypeormExportRepository } from './typeorm-export.repository';

@Module({
  imports: [
    ApiCloningFilesRepositoryModule,
    TypeOrmModule.forFeature([
      Project,
      ExportEntity,
      ExportComponentEntity,
      ExportComponentLocationEntity,
    ]),
  ],
  providers: [
    {
      provide: CloningSigningSecret,
      useFactory: () => {
        const base64Value = AppConfig.get<string>('cloning.signingSecret');

        return Buffer.from(base64Value, 'base64').toString();
      },
    },
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
      provide: ManifestFileService,
      useClass: NodeManifestFileService,
    },
  ],
  exports: [
    ExportRepository,
    ExportResourcePieces,
    ArchiveCreator,
    ManifestFileService,
  ],
})
export class ExportAdaptersModule {}
