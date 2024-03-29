import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('feature_amounts_per_planning_unit')
export class FeatureAmountsPerPlanningUnitEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'project_id' })
  projectId!: string;

  @Column('uuid', { name: 'feature_id' })
  featureId!: string;

  @Column('double precision')
  amount!: number;

  @Column('uuid', { name: 'project_pu_id' })
  projectPuId!: string;

  @ManyToOne(() => ProjectsPuEntity, (projectPu) => projectPu.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'project_pu_id',
  })
  projectPu!: ProjectsPuEntity;
}
