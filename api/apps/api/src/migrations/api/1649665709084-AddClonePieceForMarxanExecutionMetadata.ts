import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClonePieceForMarxanExecutionMetadata1649665709084
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum RENAME VALUE 'feautures-specification' TO 'features-specification'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'marxan-execution-metadata'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "clone_piece_enum_tmp" AS ENUM(
        'export-config',
        'project-metadata',
        'project-custom-protected-areas',
        'planning-area-gadm',
        'planning-area-custom',
        'planning-area-custom-geojson',
        'planning-units-grid',
        'planning-units-grid-geojson',
        'scenario-metadata',
        'scenario-planning-units-data',
        'scenario-run-results',
        'scenario-protected-areas',
        'project-custom-features',
        'feautures-specification',
        'scenario-features-data',
        'scenario-input-folder',
        'scenario-output-folder'
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
