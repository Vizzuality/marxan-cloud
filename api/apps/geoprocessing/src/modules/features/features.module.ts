import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeaturesController } from './features.controller';
import { FeatureService } from './features.service';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { GeoFeatureGeometry } from '@marxan-geoprocessing/modules/features/features.geo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeoFeatureGeometry]), TileModule],
  providers: [FeatureService],
  controllers: [FeaturesController],
  exports: [FeatureService],
})
export class FeaturesModule {}
