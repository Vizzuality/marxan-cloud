import { MigrationInterface, QueryRunner } from 'typeorm';

export class RolesUpdates1636715822155 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    UPDATE 
      roles
    SET
      name = REPLACE(name, 'project_admin','project_contributor')
    `);

    await queryRunner.query(`
    UPDATE 
      roles
    SET
      name = REPLACE(name, 'project_user','project_viewer')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    UPDATE 
      roles
    SET
      name = REPLACE(name, 'project_contributor','project_admin')
    `);

    await queryRunner.query(`
    UPDATE 
      roles
    SET
      name = REPLACE(name, 'project_viewer','project_user')
    `);
  }
}
