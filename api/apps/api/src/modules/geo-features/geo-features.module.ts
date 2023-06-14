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
import { FeatureAmountUploadRegistry } from '@marxan-api/modules/geo-features/import/features-amounts-upload-registry.api.entity';
import { UploadedFeatureAmount } from '@marxan-api/modules/geo-features/import/features-amounts-data.api.entity';
import { FeatureAmountUploadService } from '@marxan-api/modules/geo-features/import/features-amounts-upload.service';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { FeatureImportEventsService } from '@marxan-api/modules/geo-features/import/feature-import.events';

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
      FeatureAmountUploadRegistry,
      UploadedFeatureAmount,
    ]),
    ProcessingModule,
    forwardRef(() => ProjectsModule),
    ProjectAclModule,
    forwardRef(() => ScenarioFeaturesModule),
    ApiEventsModule,
    GeoFeatureTagsModule,
  ],
  providers: [
    GeoFeaturesService,
    GeoFeatureSetSerializer,
    GeoFeatureSetService,
    GeoFeaturePropertySetService,
    ProxyService,
    FeatureAmountUploadService,
    FeatureImportEventsService,
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
