import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewProcessingEvents1627979898685 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.planningAreaProtectedCalculation.finished/v1/alpha'),
      ('scenario.planningAreaProtectedCalculation.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.planningAreaProtectedCalculation.finished/v1/alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.planningAreaProtectedCalculation.failed/v1/alpha';`,
    );
  }
}
