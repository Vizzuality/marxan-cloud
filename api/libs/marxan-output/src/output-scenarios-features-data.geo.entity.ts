import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(`output_scenarios_features_data`)
export class OutputScenariosFeaturesDataGeoEntity {
  @PrimaryGeneratedColumn(`uuid`)
  id!: string;

  @Column({
    type: `uuid`,
    name: `feature_scenario_id`,
  })
  featureScenarioId!: string;

  @Column({
    type: `int`,
    name: `run_id`,
  })
  runId!: number;

  @Column({
    type: `float8`,
    name: `amount`,
  })
  amount?: number;

  @Column({
    type: `float8`,
    name: `total_area`,
    default: 0,
  })
  totalArea?: number;

  @Column({
    type: `float8`,
    name: `occurrences`,
  })
  occurrences?: number;

  @Column({
    type: `float8`,
    name: `separation`,
  })
  separation?: number;

  @Column({
    type: `boolean`,
    name: `target`,
  })
  target?: boolean;

  @Column({
    type: `float8`,
    name: `mpm`,
  })
  mpm?: number;
}
