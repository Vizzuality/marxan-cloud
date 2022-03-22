import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';

@Entity('published_projects')
export class PublishedProject {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('character varying')
  name!: string;

  @Column('character varying')
  description?: string;

  @Column('boolean', { name: 'under_moderation', default: false })
  underModeration?: boolean;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'id' })
  originalProject?: Project;
}
