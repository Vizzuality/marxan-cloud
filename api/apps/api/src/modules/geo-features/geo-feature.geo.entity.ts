import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn, ViewEntity } from 'typeorm';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';

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
  id!: string;

  @ApiProperty()
  @Column('uuid', { name: 'feature_id' })
  featureId?: string;
}

export class JSONAPIGeoFeaturesGeometryData {
  @ApiProperty()
  type = geoFeatureResource.name.plural;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: GeoFeatureGeometry;
}

export class GeoFeatureResult {
  @ApiProperty()
  data!: JSONAPIGeoFeaturesGeometryData;
}

/**
 * Entity class for the feature_properties view
 */
@ViewEntity('feature_properties')
export class GeoFeaturePropertySet {
  @ApiProperty()
  @Column('uuid', { name: 'feature_id' })
  featureId!: string;

  @ApiProperty()
  @Column('text')
  key!: string;

  @ApiProperty()
  @Column('jsonb', { array: true })
  value!: Array<string | number>;
}
