import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialProjectsAndOrganizationsTables1608218183000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`

CREATE UNIQUE INDEX unique_user_emails ON users (lower(email));
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();

UPDATE users SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  created_at timestamp NOT NULL default now()
);

CREATE UNIQUE INDEX unique_organization_names ON organizations (lower(name));

CREATE TABLE roles (
  name varchar PRIMARY KEY
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  organization_id uuid NOT NULL references organizations(id),
  created_at timestamp NOT NULL default now()
);

CREATE TABLE users_organizations (
  user_id uuid NOT NULL references users(id),
  organization_id uuid NOT NULL references organizations(id),
  role_id varchar NOT NULL references roles(name),
  CONSTRAINT organization_roles CHECK (role_id LIKE 'organization_%'),
  PRIMARY KEY (user_id, organization_id, role_id)
);

CREATE TABLE users_projects (
  user_id uuid NOT NULL references users(id),
  project_id uuid NOT NULL references projects(id),
  role_id varchar NOT NULL references roles(name),
  CONSTRAINT project_roles CHECK (role_id LIKE 'project_%'),
  PRIMARY KEY (user_id, project_id, role_id)
);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
DROP TABLE users_projects;
DROP TABLE users_organizations;
DROP TABLE roles;
DROP TABLE projects;
DROP TABLE organizations;
    `);
  }
}
