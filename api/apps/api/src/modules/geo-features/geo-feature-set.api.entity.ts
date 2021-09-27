import { ApiProperty } from '@nestjs/swagger';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';
import { JsonApiAsyncJobMeta } from '@marxan-api/dto/async-job.dto';

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

export class GeoFeatureSetResult extends JsonApiAsyncJobMeta {
  @ApiProperty()
  data!: JSONAPIGeoFeatureSetsData;
}
