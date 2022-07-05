import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('puvspr_calculations')
export class PuvsprCalculationsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'project_id' })
  projectId!: string;

  @Column('uuid', { name: 'feature_id' })
  featureId!: string;

  @Column('integer', { name: 'pu_id' })
  puid!: number;

  @Column('double precision')
  amount!: number;
}
