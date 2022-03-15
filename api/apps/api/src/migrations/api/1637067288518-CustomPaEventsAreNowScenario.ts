import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomPaEventsAreNowScenario1637067288518
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.protectedAreas.submitted/v1/alpha'),
      ('scenario.protectedAreas.finished/v1/alpha'),
      ('scenario.protectedAreas.failed/v1/alpha');
    `);

    await queryRunner.query(`
      UPDATE api_events set kind = 'scenario.protectedAreas.submitted/v1/alpha' where kind = 'project.protectedAreas.submitted/v1/alpha';
    `);

    await queryRunner.query(`
      UPDATE api_events set kind = 'scenario.protectedAreas.finished/v1/alpha' where kind = 'project.protectedAreas.finished/v1/alpha';
    `);

    await queryRunner.query(`
      UPDATE api_events set kind = 'scenario.protectedAreas.failed/v1/alpha' where kind = 'project.protectedAreas.failed/v1/alpha';
    `);

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id like 'project.protectedAreas.%';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id like 'scenario.protectedAreas.%';`,
    );
  }
}
