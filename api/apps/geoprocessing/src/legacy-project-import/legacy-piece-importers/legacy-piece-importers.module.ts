import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import {
  LegacyProjectImportFilesLocalRepository,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportStoragePath,
} from '@marxan/legacy-project-import';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../../utils/config.utils';
import { PlanningGridLegacyProjectPieceImporter } from './planning-grid.legacy-piece-importer';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectsPuEntity]), ShapefilesModule],
  providers: [
    Logger,
    {
      provide: LegacyProjectImportFilesRepository,
      useClass: LegacyProjectImportFilesLocalRepository,
    },
    {
      provide: LegacyProjectImportStoragePath,
      useFactory: () => {
        const path = AppConfig.get<string>(
          'storage.cloningFileStorage.localPath',
        );

        return path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      },
    },
    PlanningGridLegacyProjectPieceImporter,
  ],
})
export class LegacyPieceImportersModule {}
