import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLegacyProjectImportStatusLegacyProjectImport1654590080841
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "legacy_project_import_status" AS ENUM(
        'accepting',
        'running',
        'canceled',
        'completed',
        'failed'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE legacy_project_imports
      ADD COLUMN status legacy_project_import_status not null default 'accepting';
    `);

    await queryRunner.query(`
      UPDATE legacy_project_imports
        SET status = 'completed'
      WHERE is_accepting_files = false;
    `);

    await queryRunner.query(`
      ALTER TABLE legacy_project_imports
      DROP COLUMN is_accepting_files;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE legacy_project_imports
      ADD COLUMN is_accepting_files boolean not null default false;
    `);

    await queryRunner.query(`
      UPDATE legacy_project_imports
        SET is_accepting_files = true
      WHERE status = 'accepting';
    `);

    await queryRunner.query(`
      ALTER TABLE legacy_project_imports
      DROP COLUMN status;
    `);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "legacy_project_import_status";`,
    );

    await queryRunner.query(`
      ALTER TABLE legacy_project_imports
      ALTER COLUMN is_accepting_files DROP DEAFULT;
    `);
  }
}
