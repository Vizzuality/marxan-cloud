import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { FeatureAmountsPerPlanningUnitEntity } from '@marxan/feature-amounts-per-planning-unit';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosOutputResultsApiEntity } from '../../../../../libs/marxan-output/src';
import { MarxanExecutionMetadataPieceImporter } from './marxan-execution-metadata.piece-importer';
import { PlanningAreaCustomPieceImporter } from './planning-area-custom.piece-importer';
import { PlanningAreaGadmPieceImporter } from './planning-area-gadm.piece-importer';
import { PlanningUnitsGridPieceImporter } from './planning-units-grid.piece-importer';
import { ProjectCustomFeaturesPieceImporter } from './project-custom-features.piece-importer';
import { ProjectCustomProtectedAreasPieceImporter } from './project-custom-protected-areas.piece-importer';
import { ProjectMetadataPieceImporter } from './project-metadata.piece-importer';
import { ProjectFeatureAmountsPerPlanningUnitPieceImporter } from './project-feature-amounts-per-planning-unit.piece-importer';
import { ScenarioFeaturesDataPieceImporter } from './scenario-features-data.piece-importer';
import { ScenarioFeaturesSpecificationPieceImporter } from './scenario-features-specification.piece-importer';
import { ScenarioMetadataPieceImporter } from './scenario-metadata.piece-importer';
import { ScenarioPlanningUnitsDataPieceImporter } from './scenario-planning-units-data.piece-importer';
import { ScenarioProtectedAreasPieceImporter } from './scenario-protected-areas.piece-importer';
import { ScenarioRunResultsPieceImporter } from './scenario-run-results.piece-importer';
import { ProjectCostSurfacesPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/project-cost-surfaces.piece-importer';

@Module({
  imports: [
    GeoCloningFilesRepositoryModule,
    TypeOrmModule.forFeature(
      [ScenariosOutputResultsApiEntity],
      geoprocessingConnections.apiDB,
    ),
    TypeOrmModule.forFeature([
      FeatureAmountsPerPlanningUnitEntity,
      ProjectsPuEntity,
    ]),
  ],
  providers: [
    ProjectMetadataPieceImporter,
    ScenarioMetadataPieceImporter,
    PlanningAreaGadmPieceImporter,
    PlanningAreaCustomPieceImporter,
    PlanningUnitsGridPieceImporter,
    ProjectCustomProtectedAreasPieceImporter,
    ProjectCustomFeaturesPieceImporter,
    ProjectCostSurfacesPieceImporter,
    ScenarioProtectedAreasPieceImporter,
    ScenarioPlanningUnitsDataPieceImporter,
    ScenarioRunResultsPieceImporter,
    ScenarioFeaturesDataPieceImporter,
    ScenarioFeaturesSpecificationPieceImporter,
    MarxanExecutionMetadataPieceImporter,
    ProjectFeatureAmountsPerPlanningUnitPieceImporter,
  ],
})
export class PiecesImportersModule {}
