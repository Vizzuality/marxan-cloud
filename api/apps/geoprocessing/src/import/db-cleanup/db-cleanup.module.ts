import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { OutputScenariosPuDataGeoEntity } from '@marxan/marxan-output';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ProtectedArea } from '@marxan/protected-areas';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerModule } from '../../modules/worker';
import { geoprocessingConnections } from '../../ormconfig';
import { DbCleanupProcessor } from './db-cleanup.processor';
import { DbCleanupWorker } from './db-cleanup.worker';

@Module({
  imports: [
    WorkerModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
    TypeOrmModule.forFeature(
      [
        BlmFinalResultEntity,
        ScenariosPuPaDataGeo,
        OutputScenariosPuDataGeoEntity,
        PlanningArea,
        ProtectedArea,
        ProjectsPuEntity,
        GeoFeatureGeometry,
        ScenarioFeaturesData,
      ],
      geoprocessingConnections.default,
    ),
  ],
  providers: [DbCleanupProcessor, DbCleanupWorker],
})
export class DbCleanupModule {}
