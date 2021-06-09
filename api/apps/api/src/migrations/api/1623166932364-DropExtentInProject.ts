import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropExtentInProject1623166932364 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects DROP COLUMN extent;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN extent geometry;
    `);
  }
}
