import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { TimeUserEntityMetadata } from '@marxan/utils';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { defaultBlmRange } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';

@Entity('scenario_blms')
export class ScenarioBlm extends TimeUserEntityMetadata {
  @Column('decimal', { array: true, default: defaultBlmRange })
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
