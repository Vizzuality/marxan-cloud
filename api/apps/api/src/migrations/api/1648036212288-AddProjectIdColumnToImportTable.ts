import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectIdColumnToImportTable1648036212288
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE imports
      ADD COLUMN project_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    `);

    await queryRunner.query(`
      ALTER TABLE imports
      AlTER COLUMN project_id DROP DEFAULT;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE imports DROP COLUMN project_id;
    `);
  }
}
