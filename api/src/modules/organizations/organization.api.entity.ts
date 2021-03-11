import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Project } from 'modules/projects/project.api.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { TimeUserEntityMetadata } from 'types/time-user-entity-metadata';

export const organizationResource: BaseServiceResource = {
  className: 'Organization',
  name: {
    singular: 'organization',
    plural: 'organizations',
  },
  entitiesAllowedAsIncludes: ['projects'],
};

@Entity('organizations')
export class Organization extends TimeUserEntityMetadata {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('character varying')
  name: string;

  @ApiPropertyOptional()
  @Column('character varying')
  description: string;

  @ApiPropertyOptional()
  @Column('jsonb')
  metadata: Record<string, unknown>;

  @ApiPropertyOptional({ type: () => Project })
  @OneToMany((_type) => Project, (project) => project.organization)
  projects: Project[];
}

export class JSONAPIOrganizationData {
  @ApiProperty()
  type = 'organizations';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: Organization;
}

export class OrganizationResult {
  @ApiProperty()
  data: JSONAPIOrganizationData;
}
