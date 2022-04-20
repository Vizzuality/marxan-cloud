import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Creator, Resource } from '../dto/create-published-project.dto';

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

  @Column('character varying', { name: 'logo' })
  logo?: string;

  @Column({ type: 'jsonb', name: 'resources', array: true })
  resources?: Resource[];

  @Column({ type: 'jsonb', name: 'creators', array: true })
  creators?: Creator[];

  @OneToOne(() => Project)
  @JoinColumn({ name: 'id' })
  originalProject?: Project;
}
