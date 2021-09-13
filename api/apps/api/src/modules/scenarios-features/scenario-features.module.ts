import { Module } from '@nestjs/common';
import { ScenarioFeaturesService } from './scenario-features.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

import {
  ScenarioFeaturesData,
  ScenarioFeaturesGapData,
  ScenarioFeaturesOutputGapData,
} from '@marxan/features';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '../api-events/api-events.module';
import { RemoteFeaturesData } from './entities/remote-features-data.geo.entity';
import { CreateFeaturesSaga } from './create-features.saga';
import { CreateFeaturesHandler } from './create-features.handler';
import { CopyDataProvider, CopyOperation, CopyQuery } from './copy';
import { SplitDataProvider, SplitOperation, SplitQuery } from './split';
import { ScenarioFeaturesGapDataService } from './scenario-features-gap-data.service';
import { ScenarioFeaturesOutputGapDataService } from './scenario-features-output-gap-data.service';
import { MoveDataFromPreparationSaga } from './move-data-from-preparation.saga';
import { MoveDataFromPreparationHandler } from './move-data-from-preparation.handler';
import { IntersectWithPuModule } from './intersect-with-pu/intersect-with-pu.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([GeoFeature]),
    TypeOrmModule.forFeature(
      [
        ScenarioFeaturesData,
        ScenarioFeaturesGapData,
        ScenarioFeaturesOutputGapData,
        RemoteFeaturesData,
      ],
      DbConnections.geoprocessingDB,
    ),
    ProjectsModule,
    ApiEventsModule,
    IntersectWithPuModule,
  ],
  providers: [
    ScenarioFeaturesService,
    ScenarioFeaturesGapDataService,
    ScenarioFeaturesOutputGapDataService,
    CreateFeaturesSaga,
    CreateFeaturesHandler,
    CopyQuery,
    CopyDataProvider,
    CopyOperation,
    SplitQuery,
    SplitDataProvider,
    SplitOperation,
    MoveDataFromPreparationSaga,
    MoveDataFromPreparationHandler,
  ],
  exports: [
    ScenarioFeaturesService,
    ScenarioFeaturesGapDataService,
    ScenarioFeaturesOutputGapDataService,
  ],
})
export class ScenarioFeaturesModule {}
