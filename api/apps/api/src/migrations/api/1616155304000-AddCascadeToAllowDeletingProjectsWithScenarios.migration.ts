import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeToAllowDeletingProjectsWithScenarios1616155304000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenarios
  DROP CONSTRAINT scenarios_project_id_fkey,
  ADD CONSTRAINT scenarios_project_id_fkey
    FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenarios
  DROP CONSTRAINT scenarios_project_id_fkey,
  ADD CONSTRAINT scenarios_project_id_fkey
    FOREIGN KEY (project_id)
    REFERENCES projects(id);
    `);
  }
}
