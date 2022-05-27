import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdColumnToLegacyProjectImportFile1653309670832
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE legacy_project_import_files
      ADD COLUMN id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid();
    `);

    await queryRunner.query(`
      ALTER TABLE legacy_project_import_files
      ALTER COLUMN id DROP DEFAULT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE legacy_project_import_files
      DROP COLUMN id;
    `);
  }
}
