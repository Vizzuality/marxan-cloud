import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssuedAuthnToken } from '../authentication/issued-authn-token.api.entity';
import { Dictionary } from 'lodash';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../projects/project.api.entity';
import { Scenario } from '../scenarios/scenario.api.entity';
import { BaseServiceResource } from '../../types/resource.interface';

export const userResource: BaseServiceResource = {
  className: 'User',
  name: {
    singular: 'user',
    plural: 'users',
  },
  entitiesAllowedAsIncludes: ['projects'],
};

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column('character varying')
  email!: string;

  @ApiPropertyOptional()
  @Column('character varying', { name: 'display_name' })
  displayName?: string | null;

  @ApiPropertyOptional()
  @Column('character varying')
  fname?: string | null;

  @ApiPropertyOptional()
  @Column('character varying')
  lname?: string | null;

  /**
   * User avatar, stored as data url.
   *
   * For example: `data:image/gif;base64,<base64-encoded image binary data>
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'avatar_data_url' })
  avatarDataUrl?: string;

  @Column('character varying', { name: 'password_hash' })
  passwordHash!: string;

  /**
   * JSONB storage for non-relational attributes (e.g. whether a user has
   * accepted terms of use of the instance, etc.)
   *
   * @debt We should use versioned types for metadata.
   */
  @ApiPropertyOptional()
  @Column('jsonb')
  metadata?: Dictionary<string>;

  /**
   * Whether this user is active (email is confirmed).
   */
  @ApiProperty()
  @Column('boolean', { name: 'is_active' })
  isActive!: boolean;

  /**
   * Whether this user is blocked by a platform admin.
   */
  @ApiProperty()
  @Column('boolean', { name: 'is_blocked' })
  isBlocked!: boolean;

  /**
   * Whether the user should be considered as deleted. This is used to implement
   * a grace period before full deletion.
   */
  @ApiProperty()
  @Column('boolean', { name: 'is_deleted' })
  isDeleted!: boolean;

  @ApiProperty({ type: () => Project, isArray: true })
  @ManyToMany((_type) => Project, (project) => project.users, { eager: false })
  @JoinTable({
    name: 'users_projects',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
  })
  projects!: Project[];

  @ApiProperty({ type: () => Scenario, isArray: true })
  @ManyToMany((_type) => Scenario, (scenario) => scenario.users, {
    eager: false,
  })
  @JoinTable({
    name: 'users_scenarios',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'scenario_id',
      referencedColumnName: 'id',
    },
  })
  scenarios!: Scenario[];

  @OneToMany((_type) => IssuedAuthnToken, (token) => token.userId)
  issuedAuthnTokens?: IssuedAuthnToken[];
}

export class JSONAPIUserData {
  @ApiProperty()
  type = userResource.name.plural;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: User;
}

export class UserResult {
  @ApiProperty()
  data!: JSONAPIUserData;
}
