import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectSourcesEnum1653474952888
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TYPE "project_sources_enum" AS ENUM (
      'marxan_cloud',
      'legacy_import'
    );
  `);
    await queryRunner.query(`
    ALTER TABLE projects
        ADD COLUMN sources project_sources_enum not null default 'marxan_cloud';
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE projects
        DROP COLUMN sources;
    `);
    await queryRunner.query(`DROP TYPE IF EXISTS "project_sources_enum";`);
  }
}
