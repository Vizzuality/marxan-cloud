import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlmPartialResultTable1639150806467
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE blm_partial_results
      (
        id              uuid DEFAULT gen_random_uuid(),
        scenario_id     uuid NOT NULL,
        calibration_id  uuid NOT NULL,
        score           float NOT NULL,
        blm_value       float NOT NULL,
        boundary_length float NOT NULL,
        PRIMARY KEY (id))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE blm_partial_results;`);
  }
}
