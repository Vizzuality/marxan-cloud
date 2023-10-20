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
import { CreateFeaturesSaga } from './create-features.saga';
import { CreateFeaturesHandler } from './create-features.handler';
import { CopyDataProvider, CopyOperation, CopyQuery } from './copy';
import { SplitDataProvider, SplitOperation, SplitQuery } from './split';
import { ScenarioFeaturesGapDataService } from './scenario-features-gap-data.service';
import { ScenarioFeaturesOutputGapDataService } from './scenario-features-output-gap-data.service';
import { MoveDataFromPreparationSaga } from './move-data-from-preparation.saga';
import { MoveDataFromPreparationHandler } from './move-data-from-preparation.handler';
import { IntersectWithPuModule } from './intersect-with-pu/intersect-with-pu.module';
import {
  StratificationDataProvider,
  StratificationOperation,
  StratificationQuery,
} from './stratification';
import { AccessControlModule } from '@marxan-api/modules/access-control';
import { ComputeArea } from './compute-area.service';
import { LegacyProjectImportRepositoryModule } from '../legacy-project-import/infra/legacy-project-import.repository.module';
import { FeatureAmountsPerPlanningUnitModule } from '@marxan/feature-amounts-per-planning-unit';
import { SplitFeatureConfigMapper } from '../scenarios/specification/split-feature-config.mapper';
import { FeatureHashModule } from '../features-hash/features-hash.module';
import { SplitCreateFeatures } from './split/split-create-features.service';
import { Project } from '../projects/project.api.entity';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Project, GeoFeature]),
    TypeOrmModule.forFeature(
      [
        ScenarioFeaturesData,
        ScenarioFeaturesGapData,
        ScenarioFeaturesOutputGapData,
      ],
      DbConnections.geoprocessingDB,
    ),
    FeatureHashModule,
    FeatureAmountsPerPlanningUnitModule.for(DbConnections.geoprocessingDB),
    ProjectsModule,
    ApiEventsModule,
    IntersectWithPuModule,
    AccessControlModule,
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
    ComputeArea,
    SplitCreateFeatures,
    SplitQuery,
    SplitDataProvider,
    SplitOperation,
    StratificationQuery,
    StratificationDataProvider,
    StratificationOperation,
    MoveDataFromPreparationSaga,
    MoveDataFromPreparationHandler,
    SplitFeatureConfigMapper,
  ],
  exports: [
    ScenarioFeaturesService,
    ScenarioFeaturesGapDataService,
    ScenarioFeaturesOutputGapDataService,
  ],
})
export class ScenarioFeaturesModule {}
