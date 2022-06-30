import { BlmPartialResultEntity } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-partial-results.geo.entity';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import {
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ProtectedArea } from '@marxan/protected-areas';
import {
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteProjectUnusedResources } from './delete-project-unused-resources';
import { DeleteScenarioUnusedResources } from './delete-scenario-unused-resources';

@Module({
  imports: [
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
    TypeOrmModule.forFeature(
      [
        BlmFinalResultEntity,
        BlmPartialResultEntity,
        ScenariosPuPaDataGeo,
        ScenariosPlanningUnitGeoEntity,
        OutputScenariosPuDataGeoEntity,
        PlanningArea,
        ProtectedArea,
        GeoFeatureGeometry,
        ProjectsPuEntity,
        ScenarioFeaturesData,
        MarxanExecutionMetadataGeoEntity,
      ],
      geoprocessingConnections.default,
    ),
  ],
  providers: [DeleteProjectUnusedResources, DeleteScenarioUnusedResources],
  exports: [DeleteProjectUnusedResources, DeleteScenarioUnusedResources],
})
export class DeleteUnusedResourcesModule {}
