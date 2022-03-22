import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { OutputScenariosPuDataGeoEntity } from '../../marxan-output/src';
import { ScenariosPlanningUnitGeoEntity } from './scenarios-planning-unit.geo.entity';
import { ScenariosPuCostDataGeo } from './scenarios-pu-cost-data.geo.entity';

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

  @OneToOne(() => ProjectsPuEntity, (projectPu) => projectPu.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'project_pu_id',
  })
  projectPu!: ProjectsPuEntity;

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
    () => OutputScenariosPuDataGeoEntity,
    (outputScenariosPuData: OutputScenariosPuDataGeoEntity) =>
      outputScenariosPuData.scenarioPuId,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    referencedColumnName: 'scenarioPuId',
    name: 'id',
  })
  outputData?: OutputScenariosPuDataGeoEntity | null;
}
