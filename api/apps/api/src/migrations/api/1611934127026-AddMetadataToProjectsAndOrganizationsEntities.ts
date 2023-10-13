import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetadataToProjectsAndOrganizationsEntities1611934127026
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE organizations
  ADD COLUMN description text,
  ADD COLUMN metadata jsonb,
  ADD COLUMN created_by uuid NOT NULL REFERENCES users(id),
  ADD COLUMN last_modified_at timestamp without time zone NOT NULL DEFAULT now();

ALTER TABLE projects
  ADD COLUMN created_by uuid NOT NULL REFERENCES users(id),
  ADD COLUMN last_modified_at timestamp without time zone NOT NULL DEFAULT now();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE organizations
  DROP COLUMN description,
  DROP COLUMN metadata,
  DROP COLUMN created_by,
  DROP COLUMN last_modified_at;

ALTER TABLE projects
  DROP COLUMN created_by,
  DROP COLUMN last_modified_at;
    `);
  }
}
