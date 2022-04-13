import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsClonningToImportsTable1649767433793
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE imports ADD COLUMN is_cloning boolean NOT NULL DEFAULT 'false';
    `);

    await queryRunner.query(`
      ALTER TABLE imports
      AlTER COLUMN is_cloning DROP DEFAULT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE imports DROP COLUMN is_cloning;
    `);
  }
}
