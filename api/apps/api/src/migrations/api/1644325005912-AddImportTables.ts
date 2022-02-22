import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExportTables1644325005912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE export_resource_kind_enum RENAME TO clone_resource_kind_enum`,
    );
    await queryRunner.query(
      `ALTER TABLE component_locations RENAME TO export_component_locations;`,
    );

    await queryRunner.query(`
      CREATE TABLE "imports"(
        "id"                 uuid                         NOT NULL,
        "resource_id"        uuid                         NOT NULL,
        "resource_kind"      "clone_resource_kind_enum"  NOT NULL,
        "order"              integer                      NOT NULL,
        "archive_location"   text                         NOT NULL,
        CONSTRAINT "imports_pk" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "import_components"(
        "id"          uuid                NOT NULL,
        "piece"       "clone_piece_enum"  NOT NULL,
        "resource_id" uuid                NOT NULL,
        "finished"    boolean             NOT NULL,
        "import_id"   uuid                NOT NULL,
        CONSTRAINT "import_components_pk" PRIMARY KEY ("id"),
        FOREIGN KEY ("import_id") REFERENCES "imports"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "import_component_locations"(
        "uri"                 text NOT NULL,
        "relative_path"       text NOT NULL,
        "import_component_id" uuid NOT NULL,
        CONSTRAINT "import_component_location_pk" PRIMARY KEY ("uri", "relative_path"),
        FOREIGN KEY ("import_component_id") REFERENCES "import_components"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE export_component_locations RENAME TO component_locations;`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_resource_kind_enum RENAME TO export_resource_kind_enum`,
    );
    await queryRunner.query('DROP TABLE "import_component_locations"');
    await queryRunner.query('DROP TABLE "import_components"');
    await queryRunner.query('DROP TABLE "imports"');
  }
}
