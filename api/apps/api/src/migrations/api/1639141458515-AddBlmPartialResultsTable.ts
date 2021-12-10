import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlmPartialResultTable1639141458515
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE blm_partial_results
      (
        id              uuid DEFAULT gen_random_uuid(),
        scenario_id     uuid NOT NULL,
        score           float NOT NULL,
        blm_value       float NOT NULL,
        boundary_length float NOT NULL,
        PRIMARY KEY (id),
        CONSTRAINT fk_scenarios_blm_partial_results FOREIGN KEY (scenario_id) REFERENCES scenarios (id))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE blm_partial_results.scenario_id DROP CONSTRAINT fk_scenarios_blm_partial_results
            DROP TABLE blm_partial_results;`,
    );
  }
}
