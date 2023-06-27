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

@Entity('project_template_file_cache')
@Index(['projectId', 'artifactType'])
export class ProjectTemplateFileCache {
  @PrimaryColumn({
    generated: 'uuid',
    type: 'uuid',
  })
  id!: string;

  @Column()
  projectId!: string;

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

export const createProjectTemplateFileCacheFields = [
  'projectId',
  'artifactType',
  'contentType',
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const typecheckFields: readonly (keyof ProjectTemplateFileCache)[] = createProjectTemplateFileCacheFields;
