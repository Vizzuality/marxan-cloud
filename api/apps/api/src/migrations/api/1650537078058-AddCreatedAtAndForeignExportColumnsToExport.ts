import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtAndForeignExportColumnsToExport1650537078058
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE exports ADD COLUMN foreign_export boolean NOT NULL DEFAULT 'false';
    `);

    await queryRunner.query(`
      ALTER TABLE exports
      AlTER COLUMN foreign_export DROP DEFAULT;
    `);

    await queryRunner.query(`
      ALTER TABLE exports ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE export DROP COLUMN foreign_export;
    `);

    await queryRunner.query(`
      ALTER TABLE export DROP COLUMN created_at
    `);
  }
}
