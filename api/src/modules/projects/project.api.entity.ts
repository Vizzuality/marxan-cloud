import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';
import { User } from 'modules/users/user.api.entity';
import { Scenario } from 'modules/scenarios/scenario.api.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from 'modules/organizations/organization.api.entity';
import { TimeUserEntityMetadata } from 'types/time-user-entity-metadata';

@Entity('projects')
export class Project extends TimeUserEntityMetadata {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('character varying')
  name: string;

  @ApiPropertyOptional()
  @Column('character varying')
  description: string;

  /**
   * The organization to which this scenario belongs.
   */
  @ApiProperty({ type: () => Organization })
  @ManyToOne((_type) => Organization, (organization) => organization.projects)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'id',
  })
  organization: Organization;

  @Column('uuid', { name: 'organization_id' })
  organizationId: string;

  /**
   * The country where this project is located.
   */
  @Column('uuid', { name: 'country_id' })
  countryId: string;

  /**
   * The smallest administrative region that contains the whole project's
   * geometry.
   *
   * @todo Check description.
   */
  @ApiProperty()
  @Column('uuid', { name: 'admin_region_id' })
  adminRegionId: string;

  /**
   * Extent of the project
   */
  @ApiPropertyOptional()
  @Column('geometry')
  extent: Record<string, unknown> | null;

  /**
   * JSONB storage for non-relational attributes
   *
   * @debt We should use versioned types for metadata.
   */
  @ApiPropertyOptional()
  @Column('jsonb')
  metadata: Dictionary<string>;

  @ApiPropertyOptional({ type: () => Scenario })
  @OneToMany((_type) => Scenario, (scenario) => scenario.project)
  scenarios: Scenario[];

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
  @ManyToMany((_type) => User, (user) => user.projects, { eager: true })
  users: Partial<User>[];
}

export class JSONAPIProjectData {
  @ApiProperty()
  type = 'projects';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: Project;
}

export class ProjectResult {
  @ApiProperty()
  data: JSONAPIProjectData;
}
