import { Logger, Module } from '@nestjs/common';
import { FileRepositoryModule } from '@marxan/files-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { ProjectMetadataPieceExporter } from './project-metadata.piece-exporter';
import { ExportConfigProjectPieceExporter } from './export-config.project-piece-exporter';
import { PlanningAreaGadmPieceExporter } from './planning-area-gadm.piece-exporter';
import { PlanningAreaCustomGridPieceExporter } from './planning-area-custom-grid.piece-exporter';
import { PlanningAreaCustomPieceExporter } from './planning-area-custom.piece-exporter';
import { ScenarioMetadataPieceExporter } from './scenario-metadata.piece-exporter';
import { ExportConfigScenarioPieceExporter } from './export-config.scenario-piece-exporter';

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
    PlanningAreaCustomGridPieceExporter,
    ScenarioMetadataPieceExporter,
    Logger,
  ],
})
export class PiecesExportersModule {}
