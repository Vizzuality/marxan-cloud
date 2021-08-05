import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ScenariosPlanningUnitGeoEntity } from './scenarios-planning-unit.geo.entity';
import { ScenariosPuCostDataGeo } from './scenarios-pu-cost-data.geo.entity';
import { ScenariosPuOutputGeoEntity } from './scenarios-pu-output.geo.entity';
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
    (planningUnitsGeom: PlanningUnitsGeom) => planningUnitsGeom.id,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'pu_geom_id',
  })
  planningUnitGeom?: PlanningUnitsGeom | null;

  @OneToOne(
    () => ScenariosPuCostDataGeo,
    (scenariosPuCostDataGeo: ScenariosPuCostDataGeo) =>
      scenariosPuCostDataGeo.scenariosPuDataId,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    referencedColumnName: 'scenariosPuDataId',
    name: 'id',
  })
  costData?: ScenariosPuCostDataGeo | null;

  @OneToOne(
    () => ScenariosPuOutputGeoEntity,
    (scenariosPuOutputGeoEntity: ScenariosPuOutputGeoEntity) =>
      scenariosPuOutputGeoEntity.scenariosPuId,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    referencedColumnName: 'scenariosPuId',
    name: 'id',
  })
  outputData?: ScenariosPuOutputGeoEntity | null;
}
