import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { GeoFeatureSetService } from './geo-feature-set.service';
import { CreateGeoFeatureSetDTO } from './dto/create.geo-feature-set.dto';

@Injectable()
export class GeoFeatureSetSerializer {
  constructor(private readonly geoFeatureSetsService: GeoFeatureSetService) {}

  async serialize(
    entities: Partial<CreateGeoFeatureSetDTO> | undefined | (Partial<CreateGeoFeatureSetDTO> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.geoFeatureSetsService.serialize(entities, paginationMeta);
  }
}
