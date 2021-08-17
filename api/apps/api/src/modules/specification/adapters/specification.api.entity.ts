import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { SpecificationFeatureConfigApiEntity } from './specification-feature-config.api.entity';

@Entity(`specifications`)
export class SpecificationApiEntity {
  @PrimaryColumn({
    type: `uuid`,
  })
  id!: string;

  @OneToMany(
    () => SpecificationFeatureConfigApiEntity,
    (specificationFeaturesConfig) => specificationFeaturesConfig.specification,
    {
      cascade: true,
      eager: true,
    },
  )
  specificationFeaturesConfiguration?: SpecificationFeatureConfigApiEntity[];

  @ManyToOne(() => Scenario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'scenario_id',
    referencedColumnName: 'id',
  })
  scenario?: Scenario;

  @Column({
    type: `uuid`,
    name: `scenario_id`,
  })
  scenarioId!: string;

  @Column({
    type: `boolean`,
  })
  draft!: boolean;

  @Column(`jsonb`)
  raw!: Record<string, unknown>;

  @UpdateDateColumn({
    name: 'last_modified_at',
    type: 'timestamp without time zone',
  })
  lastModifiedAt!: Date;
}
