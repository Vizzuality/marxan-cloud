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
import { apiConnections } from '../../ormconfig';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [GeoFeatureGeometry, GeoFeaturePropertySet],
      apiConnections.geoprocessingDB.name,
    ),
    TypeOrmModule.forFeature([GeoFeature, Project]),
  ],
  providers: [GeoFeaturesService],
  controllers: [GeoFeaturesController],
  exports: [GeoFeaturesService],
})
export class GeoFeaturesModule {}
