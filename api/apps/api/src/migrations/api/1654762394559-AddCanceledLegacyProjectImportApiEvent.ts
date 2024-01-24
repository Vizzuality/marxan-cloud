import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCanceledLegacyProjectImportEvent1654762394559
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('project.legacy.import.canceled/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.legacy.import.canceled/v1/alpha';`,
    );
  }
}
