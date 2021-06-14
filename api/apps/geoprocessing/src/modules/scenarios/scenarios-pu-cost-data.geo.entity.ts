import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

@Entity({
  name: 'scenarios_pu_cost_data',
})
export class ScenariosPuCostDataGeo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    nullable: false,
    name: 'output_results_data_id',
  })
  planningUnitId!: string;

  @Column({
    type: 'float8',
    nullable: false,
    default: 0,
    comment: `By default we will set them as unitary based on equal area`,
  })
  cost!: number;

  @ManyToOne(() => ScenariosPlanningUnitGeoEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'scenarios_pu_data_id',
  })
  scenariosPlanningUnit?: ScenariosPlanningUnitGeoEntity | null;

  @Column({
    name: 'scenarios_pu_data_id',
  })
  @RelationId((spud: ScenariosPuCostDataGeo) => spud.scenariosPlanningUnit)
  scenariosPuDataId!: string;
}
