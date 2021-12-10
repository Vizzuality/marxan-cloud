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
