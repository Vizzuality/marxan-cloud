import { GeoLegacyProjectImportFilesRepositoryModule } from '@marxan-geoprocessing/modules/legacy-project-import-files-repository';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { FilesModule, ShapefilesModule } from '@marxan/shapefile-converter';
import { HttpModule, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioFeaturesModule } from '../../marxan-sandboxed-runner/adapters-single/solutions-output/geo-output/scenario-features/scenario-features.module';
import { SolutionsReaderService } from '../../marxan-sandboxed-runner/adapters-single/solutions-output/geo-output/solutions/output-file-parsing/solutions-reader.service';
import { PlanningUnitSelectionCalculatorService } from '../../marxan-sandboxed-runner/adapters-single/solutions-output/geo-output/solutions/solution-aggregation/planning-unit-selection-calculator.service';
import { SolutionsOutputModule } from '../../marxan-sandboxed-runner/adapters-single/solutions-output/solutions-output.module';
import { geoprocessingConnections } from '../../ormconfig';
import { FeaturesSpecificationLegacyProjectPieceImporter } from './features-specification.legacy-piece-importer';
import { FeaturesLegacyProjectPieceImporter } from './features.legacy-piece-importer';
import { FileReadersModule } from './file-readers/file-readers.module';
import { InputLegacyProjectPieceImporter } from './input.legacy-piece-importer';
import { PlanningGridLegacyProjectPieceImporter } from './planning-grid.legacy-piece-importer';
import { ScenarioPusDataLegacyProjectPieceImporter } from './scenarios-pus-data.legacy-piece-importer';
import { SolutionsLegacyProjectPieceImporter } from './solutions.legacy-piece-importer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectsPuEntity,
      ScenariosPuPaDataGeo,
      ScenariosPuCostDataGeo,
      GeoFeatureGeometry,
      ScenarioFeaturesData,
    ]),
    TypeOrmModule.forFeature(
      [ScenariosOutputResultsApiEntity],
      geoprocessingConnections.apiDB,
    ),
    ShapefilesModule,
    FileReadersModule,
    GeoLegacyProjectImportFilesRepositoryModule,
    HttpModule,
    FilesModule,
    ScenarioFeaturesModule,
    SolutionsOutputModule,
  ],
  providers: [
    Logger,
    PlanningGridLegacyProjectPieceImporter,
    ScenarioPusDataLegacyProjectPieceImporter,
    FeaturesLegacyProjectPieceImporter,
    InputLegacyProjectPieceImporter,
    FeaturesSpecificationLegacyProjectPieceImporter,
    SolutionsLegacyProjectPieceImporter,
    SolutionsReaderService,
    PlanningUnitSelectionCalculatorService,
  ],
})
export class LegacyPieceImportersModule {}
