import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioRunEvents1625810492314 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.run.submitted/v1alpha'),
      ('scenario.run.failed/v1alpha'),
      ('scenario.run.finished/v1alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id like 'scenario.run.%';`,
    );
  }
}
