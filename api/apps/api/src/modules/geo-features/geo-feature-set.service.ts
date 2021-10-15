import {
  JSONAPISerializerConfig,
  PaginationMeta,
} from '@marxan-api/utils/app-base.service';
import { Injectable } from '@nestjs/common';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { GeoFeatureSetResult } from './geo-feature-set.api.entity';

@Injectable()
export class GeoFeatureSetService {
  get serializerConfig(): JSONAPISerializerConfig<GeoFeatureSetSpecification> {
    return {
      attributes: ['status', 'features'],
      keyForAttribute: 'camelCase',
    };
  }

  async serialize(
    entities:
      | Partial<GeoFeatureSetSpecification>
      | undefined
      | (Partial<GeoFeatureSetSpecification> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<GeoFeatureSetResult> {
    const serializer = new JSONAPISerializer.Serializer('GeoFeatureSets', {
      ...this.serializerConfig,
      meta: paginationMeta,
    });

    return serializer.serialize(entities);
  }
}
