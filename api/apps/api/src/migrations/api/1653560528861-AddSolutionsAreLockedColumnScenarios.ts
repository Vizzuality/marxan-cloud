import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSolutionsAreLockedColumnScenarios1653560528861
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE scenarios
    ADD COLUMN solutions_are_locked boolean not null default false;
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE scenarios
    DROP COLUMN solutions_are_locked;
  `);
  }
}
