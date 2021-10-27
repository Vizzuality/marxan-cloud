import { IsEnum } from 'class-validator';
import { Entity, PrimaryColumn } from 'typeorm';

/**
 * This enum is used to validate role names; it needs to be updated if new
 * roles are added to the database.
 */
export enum Roles {
  organization_owner = 'organization_owner',
  project_owner = 'project_owner',
  organization_admin = 'organization_admin',
  project_admin = 'project_admin',
  organization_user = 'organization_user',
  project_user = 'project_user',
}

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'varchar' })
  @IsEnum(Object.values(Roles))
  name: string;
}
