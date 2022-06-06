import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { HttpModule, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileReadersModule } from './file-readers/file-readers.module';
import { FeaturesLegacyProjectPieceImporter } from './features.legacy-piece-importer';
import { PlanningGridLegacyProjectPieceImporter } from './planning-grid.legacy-piece-importer';
import { ScenarioPusDataLegacyProjectPieceImporter } from './scenarios-pus-data.legacy-piece-importer';
import { InputLegacyProjectPieceImporter } from './input.legacy-piece-importer';
import { GeoLegacyProjectImportFilesRepositoryModule } from '@marxan-geoprocessing/modules/legacy-project-import-files-repository';
import { FeaturesSpecificationLegacyProjectPieceImporter } from './features-specification.legacy-piece-importer';

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
    HttpModule,
  ],
  providers: [
    Logger,
    PlanningGridLegacyProjectPieceImporter,
    ScenarioPusDataLegacyProjectPieceImporter,
    FeaturesLegacyProjectPieceImporter,
    InputLegacyProjectPieceImporter,
    FeaturesSpecificationLegacyProjectPieceImporter,
  ],
})
export class LegacyPieceImportersModule {}
