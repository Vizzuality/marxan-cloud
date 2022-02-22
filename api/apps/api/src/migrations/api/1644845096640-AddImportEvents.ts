import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExportProjectEvents1644845096640 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
        ('project.import.submitted/v1/alpha'),
        ('project.import.finished/v1/alpha'),
        ('project.import.failed/v1/alpha'),
        ('project.import.piece.submitted/v1/alpha'),
        ('project.import.piece.finished/v1/alpha'),
        ('project.import.piece.failed/v1/alpha'),
        ('scenario.import.submitted/v1/alpha'),
        ('scenario.import.finished/v1/alpha'),
        ('scenario.import.failed/v1/alpha'),
        ('scenario.import.piece.submitted/v1/alpha'),
        ('scenario.import.piece.finished/v1/alpha'),
        ('scenario.import.piece.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id IN (
        'project.import.submitted/v1/alpha',
        'project.import.finished/v1/alpha',
        'project.import.failed/v1/alpha',
        'project.import.piece.submitted/v1/alpha',
        'project.import.piece.finished/v1/alpha',
        'project.import.piece.failed/v1/alpha',
        'scenario.import.submitted/v1/alpha',
        'scenario.import.finished/v1/alpha',
        'scenario.import.failed/v1/alpha',
        'scenario.import.piece.submitted/v1/alpha',
        'scenario.import.piece.finished/v1/alpha',
        'scenario.import.piece.failed/v1/alpha'
      );`,
    );
  }
}
