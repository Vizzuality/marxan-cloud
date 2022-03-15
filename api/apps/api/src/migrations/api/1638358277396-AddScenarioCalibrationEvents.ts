import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScenarioCalibrationEvents1638358277396
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.calibration.submitted/v1/alpha'),
      ('scenario.calibration.finished/v1/alpha'),
      ('scenario.calibration.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.calibration.submitted/v1/alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.calibration.finished/v1/alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.calibration.failed/v1/alpha';`,
    );
  }
}
