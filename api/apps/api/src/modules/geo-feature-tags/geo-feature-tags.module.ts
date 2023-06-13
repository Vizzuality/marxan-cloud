import { Module } from '@nestjs/common';
import { GeoFeatureTagsService } from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { ProjectAclModule } from '@marxan-api/modules/access-control/projects-acl/project-acl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeoFeatureTag, GeoFeature]),
    ProjectAclModule,
  ],
  providers: [GeoFeatureTagsService],
  exports: [GeoFeatureTagsService],
})
export class GeoFeatureTagsModule {}
