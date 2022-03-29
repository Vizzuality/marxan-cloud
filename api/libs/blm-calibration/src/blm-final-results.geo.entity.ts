import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const tableName = `blm_final_results`;

@Entity(tableName)
export class BlmFinalResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * references Scenarios.id
   */
  @Column({
    type: 'uuid',
    name: `scenario_id`,
  })
  scenarioId!: string;

  /**
   * BLM Value used for running Marxan
   */
  @Column({
    type: `float`,
    name: `blm_value`,
  })
  blmValue!: number;

  /**
   * Cost output parameter
   */
  @Column({
    name: `cost`,
    type: 'float',
  })
  cost!: number;

  /**
   * Boundary length output parameter
   */
  @Column({
    name: `boundary_length`,
    type: 'float',
  })
  boundaryLength!: number;

  @Column({
    name: `protected_pu_ids`,
    type: 'uuid',
    array: true,
  })
  protected_pu_ids!: string[];

  @Column({
    name: `png_data`,
    type: 'bytea',
  })
  pngData!: Buffer;
}
