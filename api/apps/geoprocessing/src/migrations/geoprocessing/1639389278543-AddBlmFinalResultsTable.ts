import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlmFinalResultTable1639389278543 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE blm_final_results
      (
        id              uuid DEFAULT gen_random_uuid(),
        scenario_id     uuid NOT NULL,
        score           float NOT NULL,
        blm_value       float NOT NULL,
        boundary_length float NOT NULL,
        PRIMARY KEY (id))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE blm_final_results;`);
  }
}
