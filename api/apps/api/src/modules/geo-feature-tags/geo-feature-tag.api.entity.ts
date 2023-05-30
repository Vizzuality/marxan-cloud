import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export const geoFeatureTagResource: BaseServiceResource = {
  className: 'GeoFeatureTag',
  name: {
    singular: 'geo_feature_tag',
    plural: 'geo_feature_tags',
  },
  moduleControllerPrefix: 'geo-feature-tags',
};

@Entity('project_feature_tags')
export class GeoFeatureTag extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  @Column({ type: 'uuid', name: 'feature_id' })
  featureId!: string;

  @Column({ type: 'varchar', name: 'tag' })
  tag!: string;

  @UpdateDateColumn({
    name: 'last_modified_at',
    type: 'timestamp without time zone',
  })
  lastModifiedAt!: Date;
}
