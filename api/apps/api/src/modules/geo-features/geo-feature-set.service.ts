import {
  JSONAPISerializerConfig,
  PaginationMeta,
} from '@marxan-api/utils/app-base.service';
import { Injectable } from '@nestjs/common';
import { CreateGeoFeatureSetDTO } from './dto/create.geo-feature-set.dto';
import * as JSONAPISerializer from 'jsonapi-serializer';

@Injectable()
export class GeoFeatureSetService {
  get serializerConfig(): JSONAPISerializerConfig<CreateGeoFeatureSetDTO> {
    return {
      attributes: ['status', 'features'],
      keyForAttribute: 'camelCase',
    };
  }

  async serialize(
    entities:
      | Partial<CreateGeoFeatureSetDTO>
      | undefined
      | (Partial<CreateGeoFeatureSetDTO> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    const serializer = new JSONAPISerializer.Serializer('GeoFeatureSets', {
      ...this.serializerConfig,
      meta: paginationMeta,
    });

    return serializer.serialize(entities);
  }
}
