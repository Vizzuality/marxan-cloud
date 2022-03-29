import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProtectedPUIdsPngColumnToBlmFinalResults1648570380744
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE blm_final_results
              ADD COLUMN protected_pu_ids uuid[]
              ADD COLUMN png_data bytea;
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE blm_partial_results
              DROP COLUMN protected_pu_ids
              DROP COLUMN png_data;
          `);
  }
}
