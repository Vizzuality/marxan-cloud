import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ScenariosPlanningUnitGeoEntity } from './scenarios-planning-unit.geo.entity';
import { ScenariosPuCostDataGeo } from './scenarios-pu-cost-data.geo.entity';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';

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

  @OneToOne(
    () => PlanningUnitsGeom,
    (PlanningUnitsGeom) => PlanningUnitsGeom.id,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'pu_geom_id',
    referencedColumnName: 'id',
  })
  planningUnitGeom?: PlanningUnitsGeom | null;

  @OneToOne(
    () => ScenariosPuCostDataGeo,
    (ScenariosPuCostDataGeo) => ScenariosPuCostDataGeo.id,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'pu_geom_id',
    referencedColumnName: 'id',
  })
  costData?: ScenariosPuCostDataGeo | null;
}
