import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SpecificationFeatureConfigApiEntity } from './specification-feature-config.api.entity';

@Entity(`specification_features`)
export class SpecificationFeatureApiEntity {
  @PrimaryGeneratedColumn(`uuid`)
  id!: string;

  @ManyToOne(() => SpecificationFeatureConfigApiEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'specification_feature_config_id',
    referencedColumnName: 'id',
  })
  specificationFeatureConfig?: SpecificationFeatureConfigApiEntity;

  @Column({
    type: `uuid`,
    name: `specification_feature_config_id`,
  })
  specificationFeatureConfigId!: string;

  @Column({
    type: `uuid`,
    name: `feature_id`,
  })
  featureId!: string;

  @Column({
    type: `boolean`,
  })
  calculated!: boolean;
}
