import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExportTables1641903458845 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "export_resource_kind_enum" AS ENUM('project', 'scenario');
    `);

    await queryRunner.query(`
      CREATE TYPE "clone_piece_enum" AS ENUM(
        'export-config',
        'project-metadata',
        'planning-area-gadm',
        'planning-area-shapefile',
        'planning-area-grid-shapefile',
        'scenario-metadata'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "exports"(
        "id"                 uuid                         NOT NULL,
        "resource_id"        uuid                         NOT NULL,
        "resource_kind"      "export_resource_kind_enum"  NOT NULL,
        "archive_location"   text,
        CONSTRAINT "exports_pk" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "export_components"(
        "id"          uuid                NOT NULL,
        "piece"       "clone_piece_enum"  NOT NULL,
        "resource_id" uuid                NOT NULL,
        "finished"    boolean             NOT NULL,
        "export_id"   uuid                NOT NULL,
        CONSTRAINT "export_components_pk" PRIMARY KEY ("id"),
        FOREIGN KEY ("export_id") REFERENCES "exports"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "component_locations"(
        "uri"                 text NOT NULL,
        "relative_path"       text NOT NULL,
        "export_component_id" uuid NOT NULL,
        CONSTRAINT "component_location_pk" PRIMARY KEY ("uri", "relative_path"),
        FOREIGN KEY ("export_component_id") REFERENCES "export_components"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "component_locations"');
    await queryRunner.query('DROP TABLE "export_components"');
    await queryRunner.query('DROP TABLE "exports"');

    await queryRunner.query(`DROP TYPE "clone_piece_enum"`);
    await queryRunner.query(`DROP TYPE "export_resource_kind_enum"`);
  }
}
