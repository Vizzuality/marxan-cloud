import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { PlanningUnitsGeom } from './planning-units.geo.entity';
import { CostSurfacePuDataGeoEntity } from '../../cost-surfaces/src';

//import { CostSurfacePuDataGeoEntity } from '@marxan-geoprocessing/modules/cost-surface/cost-surface-pu-data.geo.entity';

@Entity('projects_pu')
export class ProjectsPuEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'project_id', nullable: true })
  projectId?: string;

  @Column('uuid', { name: 'planning_area_id', nullable: true })
  planningAreaId?: string;

  @Column('int')
  puid!: number;

  @Column('uuid', { name: 'geom_id' })
  geomId!: string;

  @ManyToOne(() => PlanningUnitsGeom, (puGeom) => puGeom.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'geom_id',
  })
  puGeom!: PlanningUnitsGeom;

  @Column('enum', {
    name: 'geom_type',
    enum: PlanningUnitGridShape,
    enumName: 'planning_unit_grid_shape',
  })
  geomType!: PlanningUnitGridShape;

  @OneToMany(
    () => CostSurfacePuDataGeoEntity,
    (costSurfacePuData: CostSurfacePuDataGeoEntity) =>
      costSurfacePuData.projectsPu,
    { onDelete: 'CASCADE' },
  )
  costSurfacePuData!: CostSurfacePuDataGeoEntity[];
}
