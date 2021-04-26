import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';

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

export interface GeoFeatureProperty {
  key: string;
  distinctValues: string[];
}

@Entity('features')
export class GeoFeature {
  @ApiProperty()
  @PrimaryColumn()
  id: string;

  @ApiPropertyOptional()
  @Column('varchar', { name: 'feature_class_name' })
  featureClassName?: string;

  @ApiPropertyOptional()
  @Column('varchar')
  description?: string;

  @ApiPropertyOptional()
  /**
   * @todo Enable mapping of this property to a DB field once this is moved
   * over from the `features_data` table in the geodb or handled in a different
   * way (e.g. via https://vizzuality.atlassian.net/browse/MARXAN-344)
   */
  // @Column('varchar')
  source?: string;

  @ApiPropertyOptional()
  @Column('varchar')
  alias?: string;

  @ApiPropertyOptional()
  @Column('varchar', { name: 'property_name' })
  propertyName?: string;

  @ApiPropertyOptional()
  @Column('uuid')
  intersection?: string[];

  @ApiProperty()
  @Column('varchar')
  tag: FeatureTags;

  @ApiPropertyOptional()
  properties?: GeoFeatureProperty[];

  @ApiPropertyOptional()
  @Column('uuid', { name: 'project_id' })
  projectId?: string;
}

export class JSONAPIGeoFeaturesData {
  @ApiProperty()
  type = geoFeatureResource.name.plural;

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: GeoFeature;
}

export class GeoFeatureResult {
  @ApiProperty()
  data: JSONAPIGeoFeaturesData;
}
