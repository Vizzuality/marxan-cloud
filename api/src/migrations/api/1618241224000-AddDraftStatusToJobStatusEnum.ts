import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowToLinkCustomGeoFeaturesToProjects1618248224000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE features
  ADD COLUMN project_id uuid references projects(id);
ALTER TABLE features
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN created_at DROP NOT NULL,
  ALTER COLUMN last_modified_at DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE features
  DROP COLUMN project_id;
ALTER TABLE features
  -- not adding back NOT NULL to the created_by column as we wouldn't know
  -- which user(s) to set this to, at least until we implement full event
  -- logging for create/update/delete, and even then it may be overkill to
  -- use the event log to populate this field in the down side of a migration
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN last_modified_at SET NOT NULL;
    `);
  }
}
