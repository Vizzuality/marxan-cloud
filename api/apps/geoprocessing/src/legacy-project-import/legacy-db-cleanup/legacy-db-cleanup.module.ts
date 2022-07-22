import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
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
import { LegacyDbCleanupProcessor } from './legacy-db-cleanup.processor';
import { LegacyDbCleanupWorker } from './legacy-db-cleanup.worker';

@Module({
  imports: [
    WorkerModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
    TypeOrmModule.forFeature(
      [
        ScenariosPuPaDataGeo,
        OutputScenariosPuDataGeoEntity,
        PlanningArea,
        ProtectedArea,
        ProjectsPuEntity,
        GeoFeatureGeometry,
      ],
      geoprocessingConnections.default,
    ),
  ],
  providers: [LegacyDbCleanupProcessor, LegacyDbCleanupWorker],
})
export class LegacyDbCleanupModule {}
