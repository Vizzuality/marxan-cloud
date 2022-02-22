import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { TimeUserEntityMetadata } from '@marxan/utils';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

@Entity('scenario_blms')
export class ScenarioBlm extends TimeUserEntityMetadata {
  @Column('decimal', { array: true, default: [0.001, 100] })
  range!: [number, number];

  @Column('decimal', { array: true, default: [] })
  values!: number[];

  @Column('decimal', { array: true, default: [] })
  defaults!: number[];

  /**
   * The project to which this BLM Values belongs.
   */
  @PrimaryColumn('uuid')
  @OneToOne(() => Scenario)
  id!: string;
}
