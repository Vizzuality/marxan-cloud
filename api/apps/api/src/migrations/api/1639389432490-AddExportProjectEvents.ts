import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExportProjectEvents1639389432490 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('project.export.submitted/v1/alpha'),
      ('project.export.finished/v1/alpha'),
      ('project.export.failed/v1/alpha'),
      ('project.export.piece.submitted/v1/alpha'),
      ('project.export.piece.finished/v1/alpha'),
      ('project.export.piece.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.export.submitted/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.export.finished/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.export.failed/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.export.piece.submitted/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.export.piece.finished/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.export.piece.failed/v1/alpha';`,
    );
  }
}
