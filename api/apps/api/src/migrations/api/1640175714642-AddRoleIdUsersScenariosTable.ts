import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleIdUsersScenariosTable1640175714642
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE users_scenarios ADD COLUMN role_id varchar NOT NULL references roles(name),
        ADD CONSTRAINT scenario_roles CHECK (role_id LIKE 'scenario_%');`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP CONSTRAINT scenario_roles,
        ALTER TABLE users_scenarios DROP COLUMN role_id;
        `);
  }
}
