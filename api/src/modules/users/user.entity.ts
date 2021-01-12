import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { AuthenticationToken } from 'modules/authentication/authentication-token.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('character varying')
  email: string;

  @ApiProperty()
  @Column('character varying')
  fname: string | null;

  @ApiProperty()
  @Column('character varying')
  lname: string | null;

  @ApiProperty()
  @Column('character varying', { name: 'password_hash' })
  // 18 UTF-8 characters may be at most 4*18 bytes (72 bytes), which is the
  // maximum string length that can be compared fully by bcrypt (see
  // https://www.npmjs.com/package/bcrypt#security-issues-and-concerns).
  //
  // @debt I don't think we should really limit this to 18 *characters* though.
  // If users want to set longer passphrases using mostly alphanumeric
  // characters then they should welcome to do so, as long as the *effective*
  // byte count of the chosen passphrase is at most 72.
  @MaxLength(18)
  passwordHash: string;

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

  @OneToMany((_type) => AuthenticationToken, (token) => token.userId)
  authenticationTokens: AuthenticationToken[];

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
