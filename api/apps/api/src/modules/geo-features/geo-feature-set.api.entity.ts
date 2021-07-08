import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Column, PrimaryColumn } from 'typeorm';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import {
  GeoFeatureSetSpecification,
  SpecForGeoFeatureWithGeoprocessing,
  SpecForPlainGeoFeature,
} from './dto/geo-feature-set-specification.dto';

export const geoFeatureResource: BaseServiceResource = {
  className: 'GeoFeature',
  name: {
    singular: 'geo_feature',
    plural: 'geo_features',
  },
  moduleControllerPrefix: 'geo-features',
};

export enum FeatureTags {
  bioregional = 'bioregional',
  species = 'species',
}

export interface GeoFeatureCategory {
  key: string;
  distinctValues: string[];
}
export class JSONAPIGeoFeatureSetsData {
  @ApiProperty()
  type = geoFeatureResource.name.plural;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: GeoFeatureSetSpecification;
}

export class GeoFeatureSetResult {
  @ApiProperty()
  data!: JSONAPIGeoFeatureSetsData;
}
