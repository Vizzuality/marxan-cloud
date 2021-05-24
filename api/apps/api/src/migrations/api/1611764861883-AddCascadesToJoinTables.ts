import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadesToJoinTables1611764861883
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
ALTER TABLE users_projects
  DROP CONSTRAINT users_projects_project_id_fkey,
  ADD CONSTRAINT users_projects_project_id_fkey
    FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  DROP CONSTRAINT users_projects_role_id_fkey,
  ADD CONSTRAINT users_projects_role_id_fkey
    FOREIGN KEY (role_id)
   REFERENCES roles(name) ON DELETE CASCADE ON UPDATE CASCADE,
  DROP CONSTRAINT users_projects_user_id_fkey,
  ADD CONSTRAINT users_projects_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE users_organizations
  DROP CONSTRAINT users_organizations_organization_id_fkey,
  ADD CONSTRAINT users_organizations_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  DROP CONSTRAINT users_organizations_role_id_fkey,
  ADD CONSTRAINT users_organizations_role_id_fkey
    FOREIGN KEY (role_id)
    REFERENCES roles(name) ON DELETE CASCADE ON UPDATE CASCADE,
  DROP CONSTRAINT users_organizations_user_id_fkey,
  ADD CONSTRAINT users_organizations_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE issued_authn_tokens
  DROP CONSTRAINT issued_authn_tokens_user_id_fkey,
  ADD CONSTRAINT issued_authn_tokens_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
ALTER TABLE users_projects
  DROP CONSTRAINT users_projects_project_id_fkey,
  ADD CONSTRAINT users_projects_project_id_fkey
    FOREIGN KEY (project_id)
    REFERENCES projects(id),
  DROP CONSTRAINT users_projects_role_id_fkey,
  ADD CONSTRAINT users_projects_role_id_fkey
    FOREIGN KEY (role_id)
   REFERENCES roles(name),
  DROP CONSTRAINT users_projects_user_id_fkey,
  ADD CONSTRAINT users_projects_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id);

ALTER TABLE users_organizations
  DROP CONSTRAINT users_organizations_organization_id_fkey,
  ADD CONSTRAINT users_organizations_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id),
  DROP CONSTRAINT users_organizations_role_id_fkey,
  ADD CONSTRAINT users_organizations_role_id_fkey
    FOREIGN KEY (role_id)
    REFERENCES roles(name),
  DROP CONSTRAINT users_organizations_user_id_fkey,
  ADD CONSTRAINT users_organizations_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id);

ALTER TABLE issued_authn_tokens
DROP CONSTRAINT issued_authn_tokens_user_id_fkey,
ADD CONSTRAINT issued_authn_tokens_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id);
    `);
  }
}
