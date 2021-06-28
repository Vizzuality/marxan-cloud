import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { ScenariosPlanningUnitGeoEntity, ScenariosPuCostDataGeo } from '@marxan/scenarios-planning-unit';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry/planning-units.geo.entity';

@Entity({
  name: 'scenarios_pu_data',
})
export class ScenariosPuPaDataGeo extends ScenariosPlanningUnitGeoEntity {

  @Column({
    type: 'float8',
    nullable: true,
    name: 'protected_area',
  })
  protectedArea!: number;

  @OneToOne(() => PlanningUnitsGeom, PlanningUnitsGeom => PlanningUnitsGeom.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'pu_geom_id',
    referencedColumnName: 'id',
  })
  planningUnitGeom?: PlanningUnitsGeom | null;

  @OneToOne(() => ScenariosPuCostDataGeo, ScenariosPuCostDataGeo => ScenariosPuCostDataGeo.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'pu_geom_id',
    referencedColumnName: 'id',
  })
  costData?: ScenariosPuCostDataGeo | null;

}
