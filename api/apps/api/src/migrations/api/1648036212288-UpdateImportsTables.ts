import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateImportsTable1648036212288 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE imports
      ADD COLUMN project_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    `);

    await queryRunner.query(`
      ALTER TABLE imports
      AlTER COLUMN project_id DROP DEFAULT;
    `);

    await queryRunner.query(`
      ALTER TABLE import_components
      DROP COLUMN finished;
    `);

    await queryRunner.query(`
      CREATE TYPE "import_component_status" AS ENUM(
        'submitted',
        'completed',
        'failed'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE import_components
      ADD COLUMN status "import_component_status" NOT NULL DEFAULT 'completed';
    `);

    await queryRunner.query(`
      ALTER TABLE import_components
      AlTER COLUMN status DROP DEFAULT;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE imports DROP COLUMN project_id;
    `);

    await queryRunner.query(`
      ALTER TABLE import_components
      DROP COLUMN status;
    `);

    await queryRunner.query(`
      ALTER TABLE import_components
      ADD COLUMN finished boolean DEFAULT true;
    `);

    await queryRunner.query(`
      ALTER TABLE import_components
      AlTER COLUMN finished DROP DEFAULT;
    `);

    await queryRunner.query(`DROP TYPE "import_component_status"`);
  }
}
