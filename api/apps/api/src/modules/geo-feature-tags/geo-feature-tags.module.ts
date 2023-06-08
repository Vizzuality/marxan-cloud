import { Module } from '@nestjs/common';
import { GeoFeatureTagsService } from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeoFeatureTag, GeoFeature])],
  providers: [GeoFeatureTagsService],
  exports: [GeoFeatureTagsService],
})
export class GeoFeatureTagsModule {}
