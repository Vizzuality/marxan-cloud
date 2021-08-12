import { ApiProperty } from '@nestjs/swagger';
import { Geometry } from 'geojson';
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

export enum SourceType {
  user_imported = 'user_imported',
  gbif = 'gbif',
  iucn = 'iucn',
  ecoregions = 'ecoregions',
  intersection = 'intersection',
}

@Entity('features_data')
export class GeoFeatureGeometry {
  @ApiProperty()
  @PrimaryColumn()
  id!: string;

  @Column('geometry', { name: 'the_geom' })
  theGeom?: Geometry;

  @Column('jsonb')
  properties?: Record<string, string | number>;

  @Column('enum')
  source?: SourceType;

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
