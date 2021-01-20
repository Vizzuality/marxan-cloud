import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssuedAuthnToken } from 'modules/authentication/issued-authn-token.api.entity';
import { Dictionary } from 'lodash';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from 'modules/projects/project.api.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('character varying')
  email: string;

  @ApiPropertyOptional()
  @Column('character varying')
  displayName: string | null;

  @ApiPropertyOptional()
  @Column('character varying')
  fname: string | null;

  @ApiPropertyOptional()
  @Column('character varying')
  lname: string | null;

  @ApiProperty()
  @Column('character varying', { name: 'password_hash' })
  passwordHash: string;

  /**
   * JSONB storage for non-relational attributes (e.g. whether a user has
   * accepted terms of use of the instance, etc.)
   *
   * @debt We should use versioned types for metadata.
   */
  @ApiPropertyOptional()
  @Column('jsonb')
  metadata: Dictionary<string>;

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
  projects: Project[];

  @OneToMany((_type) => IssuedAuthnToken, (token) => token.userId)
  issuedAuthnTokens: IssuedAuthnToken[];

  /**
   * Whether this user is active (email is confirmed).
   *
   * @todo This is just a stub: it should be implemented as an entity property.
   */
  get isActive() {
    return true;
  }

  /**
   * Whether the user should be considered as deleted. This is used to implement
   * a grace period before full deletion.
   *
   * @todo This is just a stub: it should be implemented as an entity property.
   */
  get isDeleted() {
    return false;
  }
}
