import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLegacyProjectImportTables1652344048139
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "legacy_project_import_piece" AS ENUM(
        'planning-grid', 
        'features', 
        'scenario-pus-data', 
        'features-specification', 
        'solutions'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "legacy_project_import_file_type" AS ENUM(
        'planning-grid-shapefile',
        'input-dat',
        'pu-dat',
        'spec-dat',
        'puvspr-dat',
        'output'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "legacy_project_import_component_status" AS ENUM(
        'submitted',
        'completed',
        'failed'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "legacy_project_imports"(
        "id" uuid NOT NULL,
        "project_id" uuid UNIQUE NOT NULL,
        "scenario_id" uuid NOT NULL,
        "owner_id" uuid NOT NULL,
        "is_accepting_files" boolean NOT NULL,
        CONSTRAINT "legacy_project_imports_pk" PRIMARY KEY ("id"),
        FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "legacy_project_import_components"(
        "id" uuid NOT NULL,
        "kind" "legacy_project_import_piece" NOT NULL,
        "order" integer NOT NULL,
        "status" "legacy_project_import_component_status" NOT NULL,
        "errors" text[] NOT NULL,
        "warnings" text[] NOT NULL,
        "legacy_project_import_id" uuid NOT NULL,
        CONSTRAINT "legacy_project_import_components_pk" PRIMARY KEY ("id"),
        FOREIGN KEY ("legacy_project_import_id") REFERENCES "legacy_project_imports"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "legacy_project_import_files"(
        "location" text NOT NULL,
        "type" "legacy_project_import_file_type" NOT NULL,
        "legacy_project_import_id" uuid NOT NULL,
        CONSTRAINT "legacy_project_import_files_pk" PRIMARY KEY ("location"),
        FOREIGN KEY ("legacy_project_import_id") REFERENCES "legacy_project_imports"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "legacy_project_import_files"');
    await queryRunner.query('DROP TABLE "legacy_project_import_components"');
    await queryRunner.query('DROP TABLE "legacy_project_imports"');

    await queryRunner.query('DROP TYPE "legacy_project_import_piece"');
    await queryRunner.query('DROP TYPE "legacy_project_import_file_type"');
    await queryRunner.query(
      'DROP TYPE "legacy_project_import_component_status"',
    );
  }
}
