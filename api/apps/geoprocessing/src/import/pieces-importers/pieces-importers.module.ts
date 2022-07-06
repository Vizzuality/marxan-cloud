import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { PuvsprCalculationsEntity } from '@marxan/puvspr-calculations';
import { Logger, Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosOutputResultsApiEntity } from '../../../../../libs/marxan-output/src';
import { MarxanExecutionMetadataPieceImporter } from './marxan-execution-metadata.piece-importer';
import { PlanningAreaCustomPieceImporter } from './planning-area-custom.piece-importer';
import { PlanningAreaGadmPieceImporter } from './planning-area-gadm.piece-importer';
import { PlanningUnitsGridPieceImporter } from './planning-units-grid.piece-importer';
import { ProjectCustomFeaturesPieceImporter } from './project-custom-features.piece-importer';
import { ProjectCustomProtectedAreasPieceImporter } from './project-custom-protected-areas.piece-importer';
import { ProjectMetadataPieceImporter } from './project-metadata.piece-importer';
import { ProjectPuvsprCalculationsPieceImporter } from './project-puvspr-calculations.piece-importer';
import { ScenarioFeaturesDataPieceImporter } from './scenario-features-data.piece-importer';
import { ScenarioFeaturesSpecificationPieceImporter } from './scenario-features-specification.piece-importer';
import { ScenarioMetadataPieceImporter } from './scenario-metadata.piece-importer';
import { ScenarioPlanningUnitsDataPieceImporter } from './scenario-planning-units-data.piece-importer';
import { ScenarioProtectedAreasPieceImporter } from './scenario-protected-areas.piece-importer';
import { ScenarioRunResultsPieceImporter } from './scenario-run-results.piece-importer';

@Module({
  imports: [
    GeoCloningFilesRepositoryModule,
    TypeOrmModule.forFeature(
      [ScenariosOutputResultsApiEntity],
      geoprocessingConnections.apiDB,
    ),
    TypeOrmModule.forFeature([PuvsprCalculationsEntity]),
  ],
  providers: [
    ProjectMetadataPieceImporter,
    ScenarioMetadataPieceImporter,
    PlanningAreaGadmPieceImporter,
    PlanningAreaCustomPieceImporter,
    PlanningUnitsGridPieceImporter,
    ProjectCustomProtectedAreasPieceImporter,
    ProjectCustomFeaturesPieceImporter,
    ScenarioProtectedAreasPieceImporter,
    ScenarioPlanningUnitsDataPieceImporter,
    ScenarioRunResultsPieceImporter,
    ScenarioFeaturesDataPieceImporter,
    ScenarioFeaturesSpecificationPieceImporter,
    MarxanExecutionMetadataPieceImporter,
    ProjectPuvsprCalculationsPieceImporter,
    { provide: Logger, useClass: Logger, scope: Scope.TRANSIENT },
  ],
})
export class PiecesImportersModule {}
