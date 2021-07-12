import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndicesToPlanningArea1625037619200
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX planning_areas_project_id__idx ON "planning_areas" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX planning_areas_created_at__idx ON "planning_areas" ("created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX planning_areas_created_at__idx`);
    await queryRunner.query(`DROP INDEX planning_areas_project_id__idx`);
  }
}
