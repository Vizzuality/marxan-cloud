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

@Injectable()
export class GeoFeaturesService extends AppBaseService<
  GeoFeatureGeometry,
  CreateGeoFeatureDTO,
  UpdateGeoFeatureDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(GeoFeatureGeometry, 'geoprocessingDB')
    private readonly geoFeaturesRepository: Repository<GeoFeatureGeometry>,
  ) {
    super(
      geoFeaturesRepository,
      geoFeatureResource.name.singular,
      geoFeatureResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<GeoFeatureGeometry> {
    return {
      attributes: [],
      keyForAttribute: 'camelCase',
    };
  }

  async fakeFindOne(_id: string): Promise<GeoFeatureGeometry> {
    return this.serialize([
      {
        ...new GeoFeatureGeometry(),
      },
    ]);
  }
}
