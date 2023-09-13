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
  @JoinColumn({ name: 'puid' })
  projectsPu?: ProjectsPuEntity;

  @Column({ type: 'uuid', name: 'puid' })
  /**
   * @todo: Naming feels a bit confusing. The tasks states that this sould be a relation to ProjectsPu.id, however there are more entities with the puid column referecing planning_units
   */
  puid!: string;

  @Column({ type: 'float8' }) // Matching TypeORM type for float8
  cost!: number;
}
