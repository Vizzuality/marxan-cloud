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

export interface GeoFeatureCategory {
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
  categories?: GeoFeatureCategory[];

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
