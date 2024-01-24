import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExportScenarioEvents1643298778270
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.export.submitted/v1/alpha'),
      ('scenario.export.finished/v1/alpha'),
      ('scenario.export.failed/v1/alpha'),
      ('scenario.export.piece.submitted/v1/alpha'),
      ('scenario.export.piece.finished/v1/alpha'),
      ('scenario.export.piece.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.export.submitted/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.export.finished/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.export.failed/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.export.piece.submitted/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.export.piece.finished/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.export.piece.failed/v1/alpha';`,
    );
  }
}
