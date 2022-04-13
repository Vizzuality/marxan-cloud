import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCloningEvents1649833978405 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('project.clone.submitted/v1/alpha'),
      ('project.clone.finished/v1/alpha'),
      ('project.clone.failed/v1/alpha'),
      ('scenario.clone.submitted/v1/alpha'),
      ('scenario.clone.finished/v1/alpha'),
      ('scenario.clone.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.clone.submitted/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.clone.finished/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.clone.failed/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.clone.submitted/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.clone.finished/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.clone.failed/v1/alpha';`,
    );
  }
}
