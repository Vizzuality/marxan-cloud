import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClonePieceForScenarioInputAndOutputFolders1649242190504
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'scenario-input-folder'`,
    );
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'scenario-output-folder'`,
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
        'scenario-features-data'
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
