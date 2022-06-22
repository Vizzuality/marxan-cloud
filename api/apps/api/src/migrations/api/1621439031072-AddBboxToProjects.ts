import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBboxToProjects1621439031072 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    -----------------------------------------
    -- Generates the new column we need
    -----------------------------------------
    ALTER TABLE projects ADD COLUMN bbox jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
     ALTER TABLE projects
     DROP COLUMN bbox;
     `);
  }
}
