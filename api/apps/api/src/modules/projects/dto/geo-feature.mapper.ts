import { Injectable } from '@nestjs/common';
import { GeoFeaturesService } from '../../geo-features/geo-features.service';
import { PaginationMeta } from '../../../utils/app-base.service';
import { GeoFeature } from '../../geo-features/geo-feature.api.entity';

@Injectable()
export class GeoFeatureMapper {
  constructor(private readonly geoFeaturesService: GeoFeaturesService) {}

  async serialize(
    entities: Partial<GeoFeature> | (Partial<GeoFeature> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.geoFeaturesService.serialize(entities, paginationMeta);
  }
}
