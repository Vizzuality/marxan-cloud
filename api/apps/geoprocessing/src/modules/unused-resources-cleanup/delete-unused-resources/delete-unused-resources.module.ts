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
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteProjectUnsusedReosurces } from './delete-project-unused-resources';
import { DeleteScenarioUnsusedReosurces } from './delete-scenario-unused-resources';

@Module({
  imports: [
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
    TypeOrmModule.forFeature(
      [
        BlmFinalResultEntity,
        ScenariosPuPaDataGeo,
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
  providers: [DeleteProjectUnsusedReosurces, DeleteScenarioUnsusedReosurces],
  exports: [DeleteProjectUnsusedReosurces, DeleteScenarioUnsusedReosurces],
})
export class DeleteUnusedResourcesModule {}
