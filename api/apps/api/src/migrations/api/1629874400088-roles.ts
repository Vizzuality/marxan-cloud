import { MigrationInterface, QueryRunner } from 'typeorm';

export class Roles1629874400088 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE
                             FROM roles`);
    await queryRunner.query(`
      INSERT INTO roles (name)
      values ('organization_owner'),
             ('project_owner'),
             ('organization_admin'),
             ('project_admin'),
             ('organization_user'),
             ('project_user');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE
       FROM roles`,
    );
  }
}
