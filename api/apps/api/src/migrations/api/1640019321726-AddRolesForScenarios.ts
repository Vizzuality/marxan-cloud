import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesForScenarios1640019321726 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    INSERT INTO roles (name)
    values ('scenario_owner'),
           ('scenario_contributor'),
           ('scenario_viewer'),
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM roles WHERE name = 'scenario_owner';`);
    await queryRunner.query(
      `DELETE FROM roles WHERE name = 'scenario_contributor';`,
    );
    await queryRunner.query(
      `DELETE FROM roles WHERE name = 'scenario_viewer';`,
    );
  }
}
