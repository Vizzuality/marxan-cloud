import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixImportTable1644412600305 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE imports DROP COLUMN "order"`);
    await queryRunner.query(`
      ALTER TABLE import_components
      ADD COLUMN "order" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(
      `ALTER TABLE import_components ALTER COLUMN "order" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE import_components DROP COLUMN "order"`,
    );
    await queryRunner.query(`
      ALTER TABLE imports
      ADD COLUMN "order" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(
      `ALTER TABLE imports ALTER COLUMN "order" DROP DEFAULT`,
    );
  }
}
