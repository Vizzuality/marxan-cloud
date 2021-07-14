import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlannigAreaGeometryIdToProject1624275320285
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE projects ADD planning_area_geometry_id uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE projects DROP COLUMN planning_area_geometry_id`,
    );
  }
}
