import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileReadersModule } from './file-readers/file-readers.module';
import { FeaturesLegacyProjectPieceImporter } from './features.legacy-piece-importer';
import { PlanningGridLegacyProjectPieceImporter } from './planning-grid.legacy-piece-importer';
import { ScenarioPusDataLegacyProjectPieceImporter } from './scenarios-pus-data.legacy-piece-importer';
import { InputLegacyProjectPieceImporter } from './input.legacy-piece-importer';
import { GeoLegacyProjectImportFilesRepositoryModule } from '@marxan-geoprocessing/modules/legacy-project-import-files-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectsPuEntity,
      ScenariosPuPaDataGeo,
      ScenariosPuCostDataGeo,
    ]),
    ShapefilesModule,
    FileReadersModule,
    GeoLegacyProjectImportFilesRepositoryModule,
  ],
  providers: [
    Logger,
    PlanningGridLegacyProjectPieceImporter,
    ScenarioPusDataLegacyProjectPieceImporter,
    FeaturesLegacyProjectPieceImporter,
    InputLegacyProjectPieceImporter,
  ],
})
export class LegacyPieceImportersModule {}
