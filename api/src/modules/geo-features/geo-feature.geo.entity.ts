import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';

export const geoFeatureResource: BaseServiceResource = {
  className: 'GeoFeature',
  name: {
    singular: 'geo_feature',
    plural: 'geo_features',
  },
  moduleControllerPrefix: 'geo-features',
};

@Entity('features_data')
export class GeoFeatureGeometry {
  @ApiProperty()
  @PrimaryColumn()
  id: string;
}

export class JSONAPIGeoFeaturesGeometryData {
  @ApiProperty()
  type = geoFeatureResource.name.plural;

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: GeoFeatureGeometry;
}

export class GeoFeatureResult {
  @ApiProperty()
  data: JSONAPIGeoFeaturesGeometryData;
}
