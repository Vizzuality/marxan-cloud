import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const remoteScenarioFeaturesDataViewName = 'scenario_features_view';

@Entity(remoteScenarioFeaturesDataViewName)
export class RemoteScenarioFeaturesData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  feature_class_id!: string;

  @Column()
  scenario_id!: string;

  @Column()
  /**
   *  total area of the feature in the study area
   */
  total_area!: string;

  @Column()
  /**
   *  total area of the feature in the study area
   */
  current_pa!: string;

  @Column()
  /**
   * penalty factor
   */
  spf!: number;

  @Column()
  /**
   * target to be met for protection
   */
  target!: number;

  @Column()
  /**
   * not used yet
   * in marxan realm you can set a secondary target for a minimum clump size for the representation of conservation features in the reserve
   */
  target2!: number;
}
