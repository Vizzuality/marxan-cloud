import { IsEnum } from 'class-validator';
import { Entity, PrimaryColumn } from 'typeorm';

/**
 * This enum is used to validate role names; it needs to be updated if new
 * roles are added to the database.
 */
export enum Roles {
  organization_admin = 'organization_admin',
  organization_owner = 'organization_owner',
  organization_user = 'organization_user',
  project_owner = 'project_owner',
  project_contributor = 'project_contributor',
  project_viewer = 'project_viewer',
  scenario_owner = 'scenario_owner',
  scenario_contributor = 'scenario_contributor',
  scenario_viewer = 'scenario_viewer',
}

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'varchar', enum: Roles })
  @IsEnum(Object.values(Roles))
  name!: Roles;
}
