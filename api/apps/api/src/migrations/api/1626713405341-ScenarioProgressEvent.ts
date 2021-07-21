import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioProgressEvent1626713405341 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.run.progress/v1alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.run.progress/v1alpha';`,
    );
  }
}
