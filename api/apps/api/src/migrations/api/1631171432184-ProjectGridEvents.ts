import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectGridEvents1631171432184 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('project.grid.submitted/v1/alpha'),
      ('project.grid.finished/v1/alpha'),
      ('project.grid.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id like 'project.grid.%';`,
    );
  }
}
