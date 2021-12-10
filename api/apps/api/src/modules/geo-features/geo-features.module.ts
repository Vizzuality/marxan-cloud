import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { GeoFeature } from './geo-feature.api.entity';
import {
  GeoFeatureGeometry,
  GeoFeaturePropertySet,
} from './geo-feature.geo.entity';

import { GeoFeaturesController } from './geo-features.controller';
import { GeoFeaturesService } from './geo-features.service';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { Scenario } from '../scenarios/scenario.api.entity';
import { GeoFeatureSetSerializer } from './geo-feature-set.serializer';
import { GeoFeatureSetService } from './geo-feature-set.service';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeaturePropertySetService } from './geo-feature-property-sets.service';
import { ProcessingModule } from './processing';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { BlmPartialResultEntity } from '@marxan/blm-calibration/blm-partial-results.api.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [GeoFeatureGeometry, GeoFeaturePropertySet, ScenarioFeaturesData],
      DbConnections.geoprocessingDB,
    ),
    TypeOrmModule.forFeature([
      GeoFeature,
      Project,
      Scenario,
      BlmPartialResultEntity,
    ]),
    ProcessingModule,
  ],
  providers: [
    GeoFeaturesService,
    GeoFeatureSetSerializer,
    GeoFeatureSetService,
    GeoFeaturePropertySetService,
    ProxyService,
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
