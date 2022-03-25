import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectsPuPlanningAreaIdColumn1647859641978
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects_pu
      ADD COLUMN planning_area_id uuid;
    `);
    await queryRunner.query(`
      ALTER TABLE projects_pu
      ALTER COLUMN project_id DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE projects_pu
      DROP COLUMN planning_area_id;
    `);

    await queryRunner.query(`
      ALTER TABLE projects_pu
      ALTER COLUMN project_id SET NOT NULL;
    `);
  }
}
