import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameLegacyProjectImportFileTypes1653390136192
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'planning-grid-shapefile' TO 'planning-grid-shapefile.zip';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'input-dat' TO 'input.dat';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'pu-dat' TO 'pu.dat';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'spec-dat' TO 'spec.dat';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'puvspr-dat' TO 'puvspr.dat';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'output' TO 'output.zip';
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'planning-grid-shapefile.zip TO 'planning-grid-shapefile'';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'input.dat' TO 'input-dat';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'pu.dat' TO 'pu-dat';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'spec.dat' TO 'spec-dat';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'puvspr.dat' TO 'puvspr-dat';
        ALTER TYPE legacy_project_import_file_type RENAME VALUE 'output.zip' TO 'output';
      `,
    );
  }
}
