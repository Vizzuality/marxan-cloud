import { Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { GeoFeature } from './geo-feature.api.entity';
import {
  GeoFeatureGeometry,
  GeoFeaturePropertySet,
} from './geo-feature.geo.entity';

import { GeoFeaturesController } from './geo-features.controller';
import { GeoFeaturesService } from './geo-features.service';
import { apiConnections } from '../../ormconfig';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { Scenario } from '../scenarios/scenario.api.entity';
import { GeoFeatureSetSerializer } from './geo-feature-set.serializer';
import {
  EntityManagerToken,
  GeoFeatureSetService,
} from './geo-feature-set.service';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeaturePropertySetService } from './geo-feature-property-sets.service';
import { ProcessingModule } from './processing';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [GeoFeatureGeometry, GeoFeaturePropertySet, ScenarioFeaturesData],
      apiConnections.geoprocessingDB.name,
    ),
    TypeOrmModule.forFeature([GeoFeature, Project, Scenario]),
    ProcessingModule,
  ],
  providers: [
    GeoFeaturesService,
    GeoFeatureSetSerializer,
    GeoFeatureSetService,
    GeoFeaturePropertySetService,
    ProxyService,
    {
      provide: EntityManagerToken,
      useExisting: getEntityManagerToken(apiConnections.geoprocessingDB.name),
    },
  ],
  controllers: [GeoFeaturesController],
  exports: [
    GeoFeaturesService,
    GeoFeatureSetSerializer,
    GeoFeatureSetService,
    GeoFeaturePropertySetService,
  ],
})
export class GeoFeaturesModule {}
