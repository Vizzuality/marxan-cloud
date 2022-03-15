import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { FileRepositoryModule } from '@marxan/files-repository';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportConfigProjectPieceExporter } from './export-config.project-piece-exporter';
import { ExportConfigScenarioPieceExporter } from './export-config.scenario-piece-exporter';
import { PlanningAreaCustomGeojsonPieceExporter } from './planning-area-custom-geojson.piece-exporter';
import { PlanningAreaCustomPieceExporter } from './planning-area-custom.piece-exporter';
import { PlanningAreaGadmPieceExporter } from './planning-area-gadm.piece-exporter';
import { PlanningUnitsGridGeojsonPieceExporter } from './planning-units-grid-geojson.piece-exporter';
import { PlanningUnitsGridPieceExporter } from './planning-units-grid.piece-exporter';
import { ProjectMetadataPieceExporter } from './project-metadata.piece-exporter';
import { ScenarioMetadataPieceExporter } from './scenario-metadata.piece-exporter';
import { ScenarioProtectedAreasPieceExporter } from './scenario-protected-areas.piece-exporter';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
    TypeOrmModule.forFeature([], geoprocessingConnections.default),
  ],
  providers: [
    ProjectMetadataPieceExporter,
    ExportConfigProjectPieceExporter,
    ExportConfigScenarioPieceExporter,
    PlanningAreaGadmPieceExporter,
    PlanningAreaCustomPieceExporter,
    PlanningAreaCustomGeojsonPieceExporter,
    PlanningUnitsGridPieceExporter,
    PlanningUnitsGridGeojsonPieceExporter,
    ScenarioMetadataPieceExporter,
    ScenarioProtectedAreasPieceExporter,
    Logger,
  ],
})
export class PiecesExportersModule {}
