import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';

@Entity('cost_surface_pu_data')
export class CostSurfacePuDataEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'cost_surface_id' })
  costSurfaceId!: string;

  @ManyToOne(
    () => ProjectsPuEntity,
    (projectsPu: ProjectsPuEntity) => projectsPu.id,
  )
  @JoinColumn({ name: 'projects_pu_id' })
  projectsPu?: ProjectsPuEntity;

  @Column({ type: 'uuid', name: 'projects_pu_id' })
  projectsPuId!: string;

  @Column({ type: 'float8' }) // Matching TypeORM type for float8
  cost!: number;
}
