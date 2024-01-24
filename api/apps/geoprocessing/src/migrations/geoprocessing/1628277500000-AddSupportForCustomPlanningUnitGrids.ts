import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupportForCustomPlanningUnitGrids1628277500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
alter table planning_units_geom add column project_id uuid null;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
alter table planning_units_geom drop column project_id;
      `);
  }
}
