/**
 Usage of features data within scenarios table (will hold species and bioma data).
 CREATE TABLE "scenario_features_data" (
 "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
 "feature_class_id" uuid,
 "scenario_id" uuid,
 "total_area" varchar,
 "admin_area" timestamp,
 "current_pa" source_type,
 "spf" float8,
 "target" float8,
 "target2" float8,
 "targetocc" float8,
 "sepnum" float8,
 "created_at" timestamp NOT NULL default now(),
 "created_by" uuid NOT NULL,
 "last_modified_at" timestamp NOT NULL default now()
 );
 */

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('scenario_features_data')
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
