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
  ProjectShapefile = 'ProjectShapefile',
}

@Entity('artifact_cache')
@Index(['projectId', 'artifactType'])
export class ArtifactCache {
  @PrimaryColumn({
    generated: 'uuid',
    type: 'uuid',
  })
  id!: string;

  @Column({ name: 'project_id' })
  projectId!: string;

  @Column({ type: 'int4', nullable: true })
  artifact?: number;

  @Column({
    type: 'enum',
    name: 'artifact_type',
    enum: ArtifactType,
  })
  artifactType!: ArtifactType;

  @Column({ name: 'content_type' })
  contentType!: string;

  @CreateDateColumn({ type: 'timestamp without time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'last_modified_at',
  })
  lastModifiedAt!: Date;
}

export const createProjectTemplateFileCacheFields = [
  'projectId',
  'artifactType',
  'contentType',
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const typecheckFields: readonly (keyof ArtifactCache)[] = createProjectTemplateFileCacheFields;
