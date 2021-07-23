import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { GeoFeatureSetService } from './geo-feature-set.service';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';

@Injectable()
export class GeoFeatureSetSerializer {
  constructor(private readonly geoFeatureSetsService: GeoFeatureSetService) {}

  async serialize(
    entities:
      | Partial<GeoFeatureSetSpecification>
      | undefined
      | (Partial<GeoFeatureSetSpecification> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.geoFeatureSetsService.serialize(entities, paginationMeta);
  }
}
