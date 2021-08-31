import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SpecificationApiEntity } from './specification.api.entity';
import { FeatureSubSet, SpecificationOperation } from '../domain';
import { SpecificationFeature } from './specification-feature';

@Entity(`specification_feature_configs`)
export class SpecificationFeatureConfigApiEntity {
  @PrimaryGeneratedColumn(`uuid`)
  id!: string;

  @ManyToOne(() => SpecificationApiEntity, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({
    name: 'specification_id',
    referencedColumnName: 'id',
  })
  specification?: SpecificationApiEntity;

  @Column({
    type: `uuid`,
    name: `specification_id`,
  })
  specificationId!: string;

  @Column({
    type: 'jsonb',
    name: 'features',
  })
  features?: SpecificationFeature[];

  @Column({
    type: `uuid`,
    name: `base_feature_id`,
  })
  baseFeatureId!: string;

  @Column({
    type: `uuid`,
    name: `against_feature_id`,
    nullable: true,
  })
  againstFeatureId?: string | null;

  @Column({
    type: `enum`,
    enum: SpecificationOperation,
  })
  operation!: SpecificationOperation;

  @Column({
    type: `boolean`,
    name: `features_determined`,
  })
  featuresDetermined!: boolean;

  @Column({
    name: `split_by_property`,
    nullable: true,
    type: `varchar`,
  })
  splitByProperty?: string | null;

  @Column({
    type: `jsonb`,
    name: `select_sub_sets`,
    nullable: true,
  })
  selectSubSets?: FeatureSubSet[] | null;
}
