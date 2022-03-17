import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanningUnitGridShape } from '../../scenarios-planning-unit/src';
import { PlanningUnitsGeom } from './planning-units.geo.entity';

@Entity('projects_pu')
export class ProjectsPuEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'project_id' })
  projectId!: string;

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
}
