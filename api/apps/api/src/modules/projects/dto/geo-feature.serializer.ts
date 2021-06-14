import { Injectable } from '@nestjs/common';
import { GeoFeaturesService } from '@marxan-api/modules/geo-features/geo-features.service';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';

@Injectable()
export class GeoFeatureSerializer {
  constructor(private readonly geoFeaturesService: GeoFeaturesService) {}

  async serialize(
    entities: Partial<GeoFeature> | (Partial<GeoFeature> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.geoFeaturesService.serialize(entities, paginationMeta);
  }
}
