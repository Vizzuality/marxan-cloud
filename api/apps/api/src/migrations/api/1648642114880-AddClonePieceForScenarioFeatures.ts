import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClonePieceForScenarioFeatures1648642114880
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum RENAME VALUE 'user-uploaded-features' TO 'project-custom-features';`,
    );

    await queryRunner.query(
      `ALTER TYPE clone_piece_enum ADD VALUE 'scenario-features-data'`,
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
        'user-uploaded-features',
        'feautures-specification'
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
