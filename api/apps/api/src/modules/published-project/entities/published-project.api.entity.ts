import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import {
  Company,
  Creator,
  Resource,
} from '../dto/create-published-project.dto';

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

  @Column({ type: 'jsonb', name: 'company' })
  company?: Company;

  @Column('jsonb')
  resources?: Resource[];

  @Column('jsonb')
  creators?: Creator[];

  @OneToOne(() => Project)
  @JoinColumn({ name: 'id' })
  originalProject?: Project;
}
