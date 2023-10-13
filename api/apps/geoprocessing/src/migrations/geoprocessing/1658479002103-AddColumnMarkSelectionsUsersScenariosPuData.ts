import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnMarkSelectionsUsersScenariosPuData1658499008203
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE scenarios_pu_data ADD COLUMN lock_status_set_by_user boolean not null default false;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE scenarios
            DROP COLUMN lock_status_set_by_user;
    `);
  }
}
