import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { ScenarioFeaturesService } from '@marxan-api/modules/scenarios-features';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

@Injectable()
export class ScenarioFeatureSerializer {
  constructor(private readonly featuresCrud: ScenarioFeaturesService) {}

  async serialize(
    entities: Partial<GeoFeature> | (Partial<GeoFeature> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.featuresCrud.serialize(entities, paginationMeta);
  }
}
