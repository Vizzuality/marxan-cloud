import { Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { GeoFeature } from './geo-feature.api.entity';
import {
  GeoFeatureGeometry,
  GeoFeaturePropertySet,
} from './geo-feature.geo.entity';

import { GeoFeaturesController } from './geo-features.controller';
import { EntityManagerToken, GeoFeaturesService } from './geo-features.service';
import { apiConnections } from '../../ormconfig';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { Scenario } from '../scenarios/scenario.api.entity';
import { GeoFeatureSetSerializer } from './geo-feature-set.serializer';
import { GeoFeatureSetService } from './geo-feature-set.service';
import { RemoteScenarioFeaturesData } from '../scenarios-features/entities/remote-scenario-features-data.geo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [GeoFeatureGeometry, GeoFeaturePropertySet, RemoteScenarioFeaturesData],
      apiConnections.geoprocessingDB.name,
    ),
    TypeOrmModule.forFeature([GeoFeature, Project, Scenario]),
  ],
  providers: [
    GeoFeaturesService,
    GeoFeatureSetSerializer,
    GeoFeatureSetService,
    ProxyService,
    {
      provide: EntityManagerToken,
      useExisting: getEntityManagerToken(apiConnections.geoprocessingDB.name),
    },
  ],
  controllers: [GeoFeaturesController],
  exports: [GeoFeaturesService, GeoFeatureSetSerializer],
})
export class GeoFeaturesModule {}
