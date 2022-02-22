import { Module } from '@nestjs/common';
import { FileRepositoryModule } from '@marxan/files-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { ProjectMetadataPieceExporter } from './project-metadata.piece-exporter';
import { ExportConfigPieceExporter } from './export-config.piece-exporter';
import { PlanningAreaGadmPieceExporter } from './planning-area-gadm.piece-exporter';
import { PlanningAreaCustomGridPieceExporter } from './planning-area-custom-grid.piece-exporter';
import { PlanningAreaCustomPieceExporter } from './planning-area-custom.piece-exporter';
import { ScenarioMetadataPieceExporter } from './scenario-metadata.piece-exporter';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
  ],
  providers: [
    ProjectMetadataPieceExporter,
    ExportConfigPieceExporter,
    PlanningAreaGadmPieceExporter,
    PlanningAreaCustomPieceExporter,
    PlanningAreaCustomGridPieceExporter,
    ScenarioMetadataPieceExporter,
  ],
})
export class PiecesExportersModule {}
