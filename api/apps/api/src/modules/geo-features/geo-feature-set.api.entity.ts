import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import { GeoFeature } from './geo-feature.api.entity';
import { IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { SpecForGeoFeatureWithGeoprocessing, SpecForPlainGeoFeature } from './dto/create.geo-feature-set.dto';

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

@Entity('feature_sets')
export class GeoFeatureSet {
  @ApiProperty()
  @PrimaryColumn()
  id!: string;

  @ApiProperty()
  @Column('varchar')
  status!: JobStatus | 'draft';

  @ApiPropertyOptional()
  @Column('jsonb', { array: true })
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
