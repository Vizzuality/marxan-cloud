import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(`scenario_features_preparation`)
export class ScenarioFeaturesPreparation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'feature_class_id' })
  featuresDataId!: string;

  @Column({ name: 'scenario_id' })
  scenarioId!: string;

  @Column({ name: 'specification_id', type: 'uuid' })
  specificationId!: string;

  @Column({ name: 'total_area' })
  /**
   *  total area of the feature in the study area
   */
  totalArea!: number;

  @Column({ name: 'current_pa' })
  /**
   *  total area of the feature which is protected within the study area
   */
  currentArea!: number;

  @Column()
  /**
   * penalty factor
   */
  fpf?: number;

  @Column()
  /**
   * target to be met for protection
   */
  target?: number;

  @Column({
    name: `prop`,
    type: `float8`,
  })
  prop?: number;

  @Column({
    name: `sepnum`,
    type: `float8`,
  })
  sepNum?: number;

  @Column({
    name: `targetocc`,
    type: `float8`,
  })
  targetocc?: number;

  @Column()
  /**
   * not used yet
   * in marxan realm you can set a secondary target for a minimum clump size for the representation of conservation features in the reserve
   */
  target2?: number;

  @Column({
    name: 'metadata',
    type: 'jsonb',
  })
  metadata?: Record<'sepdistance', number | string>;
}
