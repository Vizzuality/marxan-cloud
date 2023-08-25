import * as JSONAPISerializer from 'jsonapi-serializer';
import {
  JSONAPISerializerConfig,
  PaginationMeta,
} from '@marxan-api/utils/app-base.service';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CostSurfaceSerializer {
  private pluralAlias = 'cost surfaces';

  get serializerConfig(): JSONAPISerializerConfig<CostSurface> {
    return {
      attributes: [
        'name',
        'project',
        'min',
        'max',
        'isDefault',
        'createdAt',
        'lastModifiedAt',
      ],
      keyForAttribute: 'camelCase',
      project: {
        ref: 'id',
        attributes: [
          'name',
          'description',
          'countryId',
          'adminAreaLevel1Id',
          'adminAreaLevel2Id',
          'planningUnitGridShape',
          'planningUnitAreakm2',
          'createdAt',
          'lastModifiedAt',
          'planningAreaId',
          'planningAreaName',
          'bbox',
          'customProtectedAreas',
        ],
      },
    };
  }

  async serialize(
    entities: Partial<CostSurface> | (Partial<CostSurface> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    const serializer = new JSONAPISerializer.Serializer(this.pluralAlias, {
      ...this.serializerConfig,
      meta: paginationMeta,
    });

    return serializer.serialize(entities);
  }
}
