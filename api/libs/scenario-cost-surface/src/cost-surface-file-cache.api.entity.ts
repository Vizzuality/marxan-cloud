import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ArtifactType {
  CostTemplate = 'CostTemplate',
}

@Entity('cost_surface_file_cache')
@Index(['scenarioId', 'artifactType'])
export class CostSurfaceFileCache {
  @PrimaryColumn({
    generated: 'uuid',
    type: 'uuid',
  })
  id!: string;

  @Column()
  scenarioId!: string;

  @Column({ type: 'int4', nullable: true })
  artifact?: number;

  @Column({
    type: 'enum',
    enum: ArtifactType,
  })
  artifactType!: ArtifactType;

  @Column()
  contentType!: string;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  lastModifiedAt!: Date;
}

export const createCostSurfaceFileCacheFields = [
  'scenarioId',
  'artifactType',
  'contentType',
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const typecheckFields: readonly (keyof CostSurfaceFileCache)[] =
  createCostSurfaceFileCacheFields;
