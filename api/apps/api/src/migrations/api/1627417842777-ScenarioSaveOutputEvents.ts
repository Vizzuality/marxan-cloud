import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioSaveOutputEvents1627417842777
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.run.outputSaved/v1alpha'),
      ('scenario.run.outputSaveFailed/v1alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.run.outputSaved/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.run.outputSaveFailed/v1alpha';`,
    );
  }
}
