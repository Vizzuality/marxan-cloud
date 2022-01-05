import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameScoreColumnToCostBlmResults1641378102736
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE blm_final_results
      RENAME COLUMN score TO cost; 
    `);
    await queryRunner.query(`
      ALTER TABLE blm_partial_results
      RENAME COLUMN score TO cost; 
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE blm_final_results
      RENAME COLUMN cost TO score;
    `);
    await queryRunner.query(`
      ALTER TABLE blm_partial_results
      RENAME COLUMN cost TO score;
    `);
  }
}
