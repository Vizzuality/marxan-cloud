import { Module } from '@nestjs/common';
import { GeoFeatureTagsService } from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeoFeatureTag])],
  providers: [GeoFeatureTagsService],
  exports: [GeoFeatureTagsService],
})
export class GeoFeatureTagsModule {}
