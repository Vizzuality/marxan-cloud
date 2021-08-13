import { Module } from '@nestjs/common';
import { ScenarioFeaturesService } from './scenario-features.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

import { ScenarioFeaturesData } from '@marxan/features';
import { RemoteFeaturesData } from './entities/remote-features-data.geo.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateFeaturesSaga } from './create-features.saga';
import { CreateFeaturesHandler } from './create-features.handler';
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([GeoFeature]),
    TypeOrmModule.forFeature(
      [ScenarioFeaturesData, RemoteFeaturesData],
      DbConnections.geoprocessingDB,
    ),
    ProjectsModule,
  ],
  providers: [
    ScenarioFeaturesService,
    CreateFeaturesSaga,
    CreateFeaturesHandler,
  ],
  exports: [ScenarioFeaturesService],
})
export class ScenarioFeaturesModule {}
