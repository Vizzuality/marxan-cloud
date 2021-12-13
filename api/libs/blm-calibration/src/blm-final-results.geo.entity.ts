import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

const tableName = `blm_final_results`;

@Entity(tableName)
export class BlmFinalResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * The id of the calibration run
   * **/
  @Index()
  @Column({ type: 'uuid', name: 'calibration_id' })
  calibrationId!: string;

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
   * Score of the run
   */
  @Column({
    name: `score`,
    type: 'float',
  })
  score!: number;

  /**
   * Score of the run
   */
  @Column({
    name: `boundary_length`,
    type: 'float',
  })
  boundaryLength!: number;
}
