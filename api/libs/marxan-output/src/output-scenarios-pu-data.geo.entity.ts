import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(`output_scenarios_pu_data`)
export class OutputScenariosPuDataGeoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: `value`,
    array: true,
    type: 'boolean',
    nullable: false,
  })
  values!: boolean[];

  @Column({
    name: `included_count`,
    type: 'int8',
    nullable: false,
  })
  includedCount!: number;

  @Column({
    name: `scenario_pu_id`,
    type: `uuid`,
    nullable: false,
  })
  scenarioPuId!: string;
}
