import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullableColumnsForProjectsAndScenarios1613988195000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE projects
  ADD COLUMN country_id varchar(3),
  ADD COLUMN admin_region_id uuid,
  ADD COLUMN extent geometry;

ALTER TABLE scenarios
  DROP COLUMN country_id,
  DROP COLUMN admin_region_id,
  DROP COLUMN extent;

ALTER TABLE scenarios
  ALTER COLUMN number_of_runs DROP NOT NULL,
  ALTER COLUMN blm DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenarios
  ADD COLUMN country_id varchar(3),
  ADD COLUMN admin_region_id uuid,
  ADD COLUMN extent geometry;
  
ALTER TABLE projects
  DROP COLUMN country_id,
  DROP COLUMN admin_region_id,
  DROP COLUMN extent;

ALTER TABLE scenarios
  ALTER COLUMN number_of_runs SET NULL,
  ALTER COLUMN blm SET NULL,
  ALTER COLUMN status SET NULL;
`);
  }
}
