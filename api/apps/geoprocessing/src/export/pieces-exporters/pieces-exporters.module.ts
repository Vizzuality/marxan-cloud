import { Module } from '@nestjs/common';
import { FileRepositoryModule } from '@marxan/files-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { ProjectMetadataPieceExporter } from './project-metadata.piece-exporter';
import { ProjectExportConfigPieceExporter } from './project-export-config.piece-exporter';
import { PlanningAreaGadmPieceExporter } from './planning-area-gadm.piece-exporter';
import { PlanningAreaCustomGridPieceExporter } from './planning-area-custom-grid.piece-exporter';
import { PlanningAreaCustomPieceExporter } from './planning-area-custom.piece-exporter';
import { ScenarioMetadataPieceExporter } from './scenario-metadata.piece-exporter';
import { ScenarioExportConfigPieceExporter } from './scenario-export-config.piece-exporter';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
  ],
  providers: [
    ProjectMetadataPieceExporter,
    ProjectExportConfigPieceExporter,
    PlanningAreaGadmPieceExporter,
    PlanningAreaCustomPieceExporter,
    PlanningAreaCustomGridPieceExporter,
    ScenarioExportConfigPieceExporter,
    ScenarioMetadataPieceExporter,
  ],
})
export class PiecesExportersModule {}
