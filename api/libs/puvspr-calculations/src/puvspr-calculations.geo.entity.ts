import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('puvspr_calculations')
export class PuvsprCalculationsEntity {
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
