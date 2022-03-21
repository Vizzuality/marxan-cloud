import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const tableName = `blm_partial_results`;

@Entity(tableName)
export class BlmPartialResultEntity {
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
   * Id of the calibration process
   */
  @Column({
    type: 'uuid',
    name: `calibration_id`,
  })
  calibrationId!: string;

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

  /**
   * Array of PUIDs used for solution
   */
  @Column({
    name: `protected_pu_ids`,
    type: 'int',
    array: true,
  })
  protected_pu_ids!: number[];
}
