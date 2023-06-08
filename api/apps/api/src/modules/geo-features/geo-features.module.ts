import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { GeoFeature } from './geo-feature.api.entity';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { GeoFeaturePropertySet } from './geo-feature.geo.entity';

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
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';
import { ProjectAclModule } from '@marxan-api/modules/access-control/projects-acl/project-acl.module';
import { ScenarioFeaturesModule } from '@marxan-api/modules/scenarios-features';
import { GeoFeatureTagsModule } from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [GeoFeatureGeometry, GeoFeaturePropertySet, ScenarioFeaturesData],
      DbConnections.geoprocessingDB,
    ),
    TypeOrmModule.forFeature([GeoFeature, Project, Scenario]),
    ProcessingModule,
    forwardRef(() => ProjectsModule),
    ProjectAclModule,
    forwardRef(() => ScenarioFeaturesModule),
    GeoFeatureTagsModule,
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
