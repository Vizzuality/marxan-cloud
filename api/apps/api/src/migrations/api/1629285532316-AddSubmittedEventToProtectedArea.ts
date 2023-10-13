import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmittedEventToProtectedArea1629285532316
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.planningAreaProtectedCalculation.submitted/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.planningAreaProtectedCalculation.submitted/v1/alpha';`,
    );
  }
}
