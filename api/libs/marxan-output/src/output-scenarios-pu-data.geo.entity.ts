import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(`output_scenarios_pu_data`)
export class OutputScenariosPuDataGeoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: `value`,
    type: `float8`,
    nullable: true,
  })
  value?: 0 | 1 | null;

  @Column({
    name: `run_id`,
    type: `int`,
    nullable: true,
  })
  runId?: number | null;

  @Column({
    name: `scenario_pu_id`,
    type: `uuid`,
    nullable: false,
  })
  scenarioPuId!: string;
}
