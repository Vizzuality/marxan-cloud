import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateScenarioTableForProtectedAreaSelection1616764914000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenarios
  RENAME COLUMN wdpa_filter TO protected_area_filter_by_ids;
ALTER TABLE scenarios
  ADD COLUMN wdpa_iucn_categories varchar[],
  ADD COLUMN custom_protected_area_ids uuid[];
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenarios
  RENAME COLUMN protected_area_filter_by_ids TO wdpa_filter;
ALTER TABLE scenarios
  DROP COLUMN wdpa_iucn_categories,
  DROP COLUMN custom_protected_area_ids;
    `);
  }
}
