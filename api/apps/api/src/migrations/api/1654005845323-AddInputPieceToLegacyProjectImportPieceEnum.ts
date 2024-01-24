import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInputPieceToLegacyProjectImportPieceEnum1654005845323
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE legacy_project_import_piece ADD VALUE 'input'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "legacy_project_import_piece_tmp" AS ENUM(
        'planning-grid', 
        'features', 
        'scenario-pus-data', 
        'features-specification', 
        'solutions'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE legacy_project_import_components
      ALTER COLUMN kind TYPE legacy_project_import_piece_tmp USING kind::text::legacy_project_import_piece_tmp;
    `);

    await queryRunner.query(`
      DROP TYPE legacy_project_import_piece;
    `);
    await queryRunner.query(`
      ALTER TYPE legacy_project_import_piece_tmp RENAME TO legacy_project_import_piece;
    `);
  }
}
