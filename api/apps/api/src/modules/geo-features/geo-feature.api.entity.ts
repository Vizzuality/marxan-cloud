import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import { JobStatus } from '../scenarios/scenario.api.entity';
import { Project } from '../projects/project.api.entity';
import { User } from '../users/user.api.entity';
import { SingleConfigFeatureValueStripped } from '@marxan/features-hash';

export const geoFeatureResource: BaseServiceResource = {
  className: 'GeoFeature',
  name: {
    singular: 'geo_feature',
    plural: 'geo_features',
  },
  moduleControllerPrefix: 'geo-features',
};

export interface GeoFeatureProperty {
  key: string;
  distinctValues: Array<string | number>;
}

@Entity('features')
export class GeoFeature extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn()
  id!: string;

  @ApiPropertyOptional()
  @Column('varchar', { name: 'feature_class_name' })
  featureClassName?: string;

  @ApiPropertyOptional()
  @Column('varchar')
  description?: string | null;

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
  alias?: string | null;

  @ApiPropertyOptional()
  @Column('varchar', { name: 'property_name' })
  propertyName?: string;

  @ApiPropertyOptional()
  @Column('uuid')
  intersection?: string[];

  @Column('varchar', { name: 'creation_status' })
  creationStatus?: JobStatus;

  @ApiPropertyOptional()
  properties?: GeoFeatureProperty[];

  @ApiPropertyOptional()
  @Column('uuid', { name: 'project_id' })
  projectId?: string;

  @ApiProperty({ type: () => Project })
  @ManyToOne((_type) => Project, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
  })
  project?: Project;

  @ManyToOne((_type) => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'created_by',
    referencedColumnName: 'id',
  })
  createdBy?: User;

  @ApiPropertyOptional()
  @Column('boolean', { name: 'is_custom' })
  isCustom?: boolean;

  @Column('boolean', { name: 'is_legacy' })
  isLegacy!: boolean;

  @Column('jsonb', { name: 'from_geoprocessing_ops', nullable: true })
  fromGeoprocessingOps?: SingleConfigFeatureValueStripped;

  @Column('text', { name: 'geoprocessing_ops_hash', nullable: true })
  geoprocessingOpsHash?: string;

  @ApiPropertyOptional()
  tag?: string;

  @ApiPropertyOptional()
  scenarioUsageCount?: number;
}

export class JSONAPIGeoFeaturesData {
  @ApiProperty()
  type = geoFeatureResource.name.plural;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: GeoFeature;
}

export class GeoFeatureResult {
  @ApiProperty()
  data!: JSONAPIGeoFeaturesData;
}
