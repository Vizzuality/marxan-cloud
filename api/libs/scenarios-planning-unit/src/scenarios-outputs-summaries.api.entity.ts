import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

const tableName = `output_scenarios_summaries`;

@Entity(tableName)
export class ScenariosOutputResultsApiEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * references ScenariosPlanningUnitGeoEntity.planningUnitMarxanId
   */
  @Column({
    type: 'uuid',
    nullable: false,
    name: `scenario_id`,
  })
  scenarioId!: string;
  /**
   * TODO describe/change
   */
  @Column({
    type: `int`,
    nullable: true,
    name: `run_id`,
  })
  runId?: number | null;

  /**
   * Score of the run
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `score`,
  })
  scoreValue?: number | null;

  /**
   * cost of the run
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `cost`,
  })
  costValue?: number | null;

  /**
   * nº planning units of the run
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `planning_units`,
  })
  planningUnits?: number | null;

  /**
   * The total boundary length of the reserve system.
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `connectivity`,
  })
  connectivity?: number | null;

  /**
   * Total boundary of planning units in study area.
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `connectivity_total`,
  })
  connectivityTotal?: number | null;

  /**
   * Minimum Proportion Met for the worst performing feature.
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `mpm`,
  })
  mpm?: number | null;

  /**
   * The penalty that was added to the objective function
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `penalty`,
  })
  penaltyValue?: number | null;

  /**
   * The amount by which the targets for conservation features have not been met
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `shortfall`,
  })
  shortfall?: number | null;

  /**
   * The number of features that did not achieve their targets
   */
  @Column({
    type: `float8`,
    nullable: true,
    name: `missing_values`,
  })
  missingValues?: number | null;

  /**g
   * Best solution/run for the scenario (1 per scenario)
   */
  @Column({
    type: `bool`,
    nullable: true,
    name: `best`,
  })
  best?: boolean | null;

  /**
   * 5 most different solution in the results (5 per scenario)
   */
  @Column({
    type: `bool`,
    nullable: true,
    name: `distinct_five`,
  })
  distinctFive?: boolean | null;

  /**
   * metadata
   */
  @Column({
    type: `jsonb`,
    nullable: true,
    name: `metadata`,
  })
  metadata?: JSON | null;
}
