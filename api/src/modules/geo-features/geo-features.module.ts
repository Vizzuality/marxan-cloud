import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoFeature } from './geo-feature.api.entity';
import { GeoFeatureGeometry } from './geo-feature.geo.entity';

import { GeoFeaturesController } from './geo-features.controller';
import { GeoFeaturesService } from './geo-features.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeoFeatureGeometry], 'geoprocessingDB'),
    TypeOrmModule.forFeature([GeoFeature]),
  ],
  providers: [GeoFeaturesService],
  controllers: [GeoFeaturesController],
  exports: [GeoFeaturesService],
})
export class GeoFeaturesModule {}
