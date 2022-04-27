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

  @Column('character varying')
  location?: string;

  @Column('boolean', { name: 'under_moderation', default: false })
  underModeration?: boolean;

  @Column({ type: 'jsonb', name: 'company' })
  company?: Company;

  @Column('jsonb')
  resources?: Resource[];

  @Column('jsonb')
  creators?: Creator[];

  @Column('character varying', { name: 'png_data' })
  pngData?: string;

  @Column('uuid', { name: 'export_id' })
  exportId?: string;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'id' })
  originalProject?: Project;
}
