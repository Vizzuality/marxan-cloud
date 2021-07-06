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
  runId?: string | null;

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
   * nº planning units of the run
   */
   @Column({
    type: `float8`,
    nullable: true,
    name: `connectivity`,
  })
  connectivity?: number | null;

  /**
   * nº planning units of the run
   */
   @Column({
    type: `float8`,
    nullable: true,
    name: `connectivity_total`,
  })
  connectivityTotal?: number | null;

  /**
   * nº planning units of the run
   */
   @Column({
    type: `float8`,
    nullable: true,
    name: `mpm`,
  })
  mpm?: number | null;

  /**
   * nº planning units of the run
   */
    @Column({
      type: `float8`,
      nullable: true,
      name: `penalty`,
    })
  penaltyValue?: number | null;

  /**
   * nº planning units of the run
   */
   @Column({
    type: `float8`,
    nullable: true,
    name: `shortfall`,
  })
  shortfall?: number | null;

   /**
   * nº planning units of the run
   */
    @Column({
      type: `float8`,
      nullable: true,
      name: `missing_values`,
    })
    missing_values?: number | null;

    /**
   * nº planning units of the run
   */
     @Column({
      type: `bool`,
      nullable: true,
      name: `best`,
    })
    best?: boolean | null;

    /**
   * nº planning units of the run
   */
     @Column({
      type: `bool`,
      nullable: true,
      name: `distinct`,
    })
    distinct?: boolean | null;

   /**
   * nº planning units of the run
   */
    @Column({
      type: `jsonb`,
      nullable: true,
      name: `metadata`,
    })
    metadata?: JSON | null;
}
