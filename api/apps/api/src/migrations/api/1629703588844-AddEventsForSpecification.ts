import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventsForSpecification1629703588844
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.specification.submitted/v1alpha'),
      ('scenario.specification.failed/v1alpha'),
      ('scenario.specification.finished/v1alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.specification.submitted/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.specification.failed/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.specification.finished/v1alpha';`,
    );
  }
}
