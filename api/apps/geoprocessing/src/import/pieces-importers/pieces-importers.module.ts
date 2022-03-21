import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { FileRepositoryModule } from '@marxan/files-repository';
import { Logger, Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningAreaCustomPieceImporter } from './planning-area-custom.piece-importer';
import { PlanningAreaGadmPieceImporter } from './planning-area-gadm.piece-importer';
import { PlanningUnitsGridPieceImporter } from './planning-units-grid.piece-importer';
import { ProjectCustomProtectedAreasPieceImporter } from './project-custom-protected-areas.piece-importer';
import { ProjectMetadataPieceImporter } from './project-metadata.piece-importer';
import { ScenarioMetadataPieceImporter } from './scenario-metadata.piece-importer';
import { ScenarioPlanningUnitsDataPieceImporter } from './scenario-planning-units-data.piece-importer';
import { ScenarioProtectedAreasPieceImporter } from './scenario-protected-areas.piece-importer';
import { ScenarioRunResultsPieceImporter } from './scenario-run-results.piece-importer';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
  ],
  providers: [
    ProjectMetadataPieceImporter,
    ScenarioMetadataPieceImporter,
    PlanningAreaGadmPieceImporter,
    PlanningAreaCustomPieceImporter,
    PlanningUnitsGridPieceImporter,
    ProjectCustomProtectedAreasPieceImporter,
    ScenarioProtectedAreasPieceImporter,
    ScenarioPlanningUnitsDataPieceImporter,
    ScenarioRunResultsPieceImporter,
    { provide: Logger, useClass: Logger, scope: Scope.TRANSIENT },
  ],
})
export class PiecesImportersModule {}
