import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImportLegacyProjectsApiEvents1652099652734
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('project.legacy.import.submitted/v1/alpha'),
      ('project.legacy.import.finished/v1/alpha'),
      ('project.legacy.import.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.legacy.import.submitted/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.legacy.import.finished/v1/alpha';`,
    );

    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.legacy.import.failed/v1/alpha';`,
    );
  }
}
