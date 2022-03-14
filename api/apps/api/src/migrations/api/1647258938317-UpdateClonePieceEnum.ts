import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateClonePieceEnum1647258938317 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum RENAME VALUE 'planning-area-shapefile' TO 'planning-area-custom';`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum RENAME VALUE 'planning-area-grid-shapefile' TO 'planning-area-grid';`,
    );

    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'planning-area-custom-geojson'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'planning-area-grid-geojson'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'scenario-pu-data'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'scenario-run-results'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'project-custom-protected-areas'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'scenario-protected-areas'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'user-uploaded-features'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'feautures-specification'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "clone_piece_enum_tmp" AS ENUM(
        'export-config',
        'project-metadata',
        'planning-area-gadm',
        'planning-area-shapefile',
        'planning-area-grid-shapefile',
        'scenario-metadata'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE export_components
      ALTER COLUMN piece TYPE clone_piece_enum_tmp;
    `);
    await queryRunner.query(`
      ALTER TABLE import_components
      ALTER COLUMN piece TYPE clone_piece_enum_tmp;
    `);

    await queryRunner.query(`
      DROP TYPE clone_piece_enum;
    `);
    await queryRunner.query(`
      ALTER TYPE clone_piece_enum_tmp RENAME TO clone_piece_enum;
    `);
  }
}
