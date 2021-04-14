import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
import {
  GeoFeatureGeometry,
  geoFeatureResource,
} from './geo-feature.geo.entity';
import { CreateGeoFeatureDTO } from './dto/create.geo-feature.dto';
import { UpdateGeoFeatureDTO } from './dto/update.geo-feature.dto';

import * as faker from 'faker';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { FeatureTags, GeoFeature } from './geo-feature.api.entity';

@Injectable()
export class GeoFeaturesService extends AppBaseService<
  GeoFeature,
  CreateGeoFeatureDTO,
  UpdateGeoFeatureDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(GeoFeatureGeometry, 'geoprocessingDB')
    private readonly geoFeaturesGeometriesRepository: Repository<GeoFeatureGeometry>,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepository: Repository<GeoFeature>,
  ) {
    super(
      geoFeaturesRepository,
      geoFeatureResource.name.singular,
      geoFeatureResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<GeoFeature> {
    return {
      attributes: [
        'featureClassName',
        'alias',
        'propertyName',
        'intersection',
        'tag',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async fakeFindOne(_id: string): Promise<GeoFeature> {
    return {
      ...new GeoFeature(),
      id: faker.random.uuid(),
      featureClassName: faker.random.alphaNumeric(15),
      alias: faker.random.words(8),
      propertyName: faker.random.words(8),
      intersection: [...Array(4)].map((_i) => faker.random.uuid()),
      tag: faker.random.arrayElement(Object.values(FeatureTags)),
    };
  }
}
