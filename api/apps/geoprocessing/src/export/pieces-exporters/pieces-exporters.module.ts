import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ScenarioFeaturesData } from '@marxan/features';
import {
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosFeaturesDataGeoEntity,
} from '@marxan/marxan-output';
import { PuvsprCalculationsModule } from '@marxan/puvspr-calculations';
import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportConfigProjectPieceExporter } from './export-config.project-piece-exporter';
import { ExportConfigScenarioPieceExporter } from './export-config.scenario-piece-exporter';
import { MarxanExecutionMetadataPieceExporter } from './marxan-execution-metadata.piece-exporter';
import { PlanningAreaCustomGeojsonPieceExporter } from './planning-area-custom-geojson.piece-exporter';
import { PlanningAreaCustomPieceExporter } from './planning-area-custom.piece-exporter';
import { PlanningAreaGadmPieceExporter } from './planning-area-gadm.piece-exporter';
import { PlanningUnitsGridGeojsonPieceExporter } from './planning-units-grid-geojson.piece-exporter';
import { PlanningUnitsGridPieceExporter } from './planning-units-grid.piece-exporter';
import { ProjectCustomFeaturesPieceExporter } from './project-custom-features.piece-exporter';
import { ProjectCustomProtectedAreasPieceExporter } from './project-custom-protected-areas.piece-exporter';
import { ProjectMetadataPieceExporter } from './project-metadata.piece-exporter';
import { ProjectPuvsprCalculationsPieceExporter } from './project-puvspr-calculations.piece-exporter';
import { ScenarioFeaturesDataPieceExporter } from './scenario-features-data.piece-exporter';
import { ScenarioFeaturesSpecificationPieceExporter } from './scenario-features-specification.piece-exporter';
import { ScenarioInputFolderPieceExporter } from './scenario-input-folder.piece-exporter';
import { ScenarioMetadataPieceExporter } from './scenario-metadata.piece-exporter';
import { ScenarioOutputFolderPieceExporter } from './scenario-output-folder.piece-exporter';
import { ScenarioPlanningUnitsDataPieceExporter } from './scenario-planning-units-data.piece-exporter';
import { ScenarioProtectedAreasPieceExporter } from './scenario-protected-areas.piece-exporter';
import { ScenarioRunResultsPieceExporter } from './scenario-run-results.piece-exporter';

@Module({
  imports: [
    GeoCloningFilesRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
    TypeOrmModule.forFeature(
      [
        ProjectsPuEntity,
        ScenarioFeaturesData,
        OutputScenariosFeaturesDataGeoEntity,
        MarxanExecutionMetadataGeoEntity,
      ],
      geoprocessingConnections.default,
    ),
    PuvsprCalculationsModule.for(geoprocessingConnections.default.name!),
    HttpModule,
  ],
  providers: [
    ProjectMetadataPieceExporter,
    ExportConfigProjectPieceExporter,
    ExportConfigScenarioPieceExporter,
    ProjectCustomFeaturesPieceExporter,
    PlanningAreaGadmPieceExporter,
    PlanningAreaCustomPieceExporter,
    PlanningAreaCustomGeojsonPieceExporter,
    PlanningUnitsGridPieceExporter,
    PlanningUnitsGridGeojsonPieceExporter,
    ProjectCustomProtectedAreasPieceExporter,
    ScenarioMetadataPieceExporter,
    ScenarioProtectedAreasPieceExporter,
    ScenarioRunResultsPieceExporter,
    ScenarioPlanningUnitsDataPieceExporter,
    ScenarioFeaturesDataPieceExporter,
    ScenarioInputFolderPieceExporter,
    ScenarioOutputFolderPieceExporter,
    ScenarioFeaturesSpecificationPieceExporter,
    MarxanExecutionMetadataPieceExporter,
    ProjectPuvsprCalculationsPieceExporter,
    Logger,
  ],
})
export class PiecesExportersModule {}
