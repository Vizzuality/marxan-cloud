import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOnDeleteCascadeOnProjectsLegacyProjectImport1654769225640
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE legacy_project_imports 
        DROP CONSTRAINT legacy_project_imports_project_id_fkey;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE legacy_project_imports
        ADD CONSTRAINT legacy_project_imports_project_id_fkey FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
    `);
  }
}
