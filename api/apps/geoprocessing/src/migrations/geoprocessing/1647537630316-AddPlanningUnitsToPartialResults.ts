import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanningUnitsToPartialResults1647537630316
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE blm_partial_results
            ADD COLUMN protected_pu_ids uuid[];
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE blm_partial_results
            DROP COLUMN protected_pu_ids;
        `);
  }
}
