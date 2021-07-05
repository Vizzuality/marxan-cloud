import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Column, PrimaryColumn } from 'typeorm';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import {
  SpecForGeoFeatureWithGeoprocessing,
  SpecForPlainGeoFeature,
} from './dto/create.geo-feature-set.dto';

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

export class GeoFeatureSet {
  @ApiProperty()
  status!: JobStatus | 'draft';

  @ApiPropertyOptional()
  features?: Array<SpecForPlainGeoFeature | SpecForGeoFeatureWithGeoprocessing>;
}

export class JSONAPIGeoFeatureSetsData {
  @ApiProperty()
  type = geoFeatureResource.name.plural;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: GeoFeatureSet;
}

export class GeoFeatureSetResult {
  @ApiProperty()
  data!: JSONAPIGeoFeatureSetsData;
}
