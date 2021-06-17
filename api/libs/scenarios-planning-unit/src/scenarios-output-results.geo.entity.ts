import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

const tableName = `output_results_data`;

@Entity(tableName)
export class ScenariosOutputResultsGeoEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * references ScenariosPlanningUnitGeoEntity.planningUnitMarxanId
   */
  @Column({
    type: 'int',
    nullable: true,
    name: `puid`,
  })
  scenariosPuDataPlanningUnitMarxanId?: number | null;

  @Column({
    type: `uuid`,
    nullable: true,
    name: `scenario_id`,
  })
  scenarioId?: string | null;

  /**
   * TODO describe/change
   */
  @Column({
    type: `uuid`,
    nullable: true,
    name: `run_id`,
  })
  runId?: string | null;

  /**
   * Score of the run
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `value`,
  })
  scoreValue?: number | null;

  /**
   * TODO describe/change
   */
  @Column({
    type: `jsonb`,
    nullable: true,
    name: `missing_values`,
  })
  missingValuesJsonb?: unknown | null;

  /**
   * API fields
   * --------------------
   */

  @ApiProperty({
    description: `The number of planning units contained in the solution for that run.`,
  })
  planningUnits!: number;

  @ApiProperty({
    description: `The number of planning units omitted in the solution for that run.`,
  })
  missingValues!: number;

  // TODO describe
  @ApiProperty({
    description: `TODO`,
  })
  cost!: number;

  @ApiProperty({
    description: `Score value of the solution - the higher, the better.`,
  })
  score!: number;

  // TODO describe
  @ApiProperty({
    description: ``,
  })
  run!: number;
}
