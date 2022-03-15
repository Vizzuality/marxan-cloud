import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedScenarioColumns1647358435682
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE scenarios
        DROP COLUMN wdpa_iucn_categories,
        DROP COLUMN custom_protected_area_ids;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE scenarios
        ADD COLUMN wdpa_iucn_categories varchar[],
        ADD COLUMN custom_protected_area_ids uuid[];
    `);
  }
}
