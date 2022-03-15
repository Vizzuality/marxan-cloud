import { MigrationInterface, QueryRunner } from 'typeorm';

export class PuGeometryUniqueWithinProject1631080265630
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table planning_units_geom
        drop constraint planning_units_geom_the_geom_type_key;

      alter table planning_units_geom
        add constraint planning_units_geom_the_geom_type_key
          unique (the_geom, type, project_id);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table planning_units_geom
        drop constraint planning_units_geom_the_geom_type_key;

      alter table planning_units_geom
        add constraint planning_units_geom_the_geom_type_key
          unique (the_geom, type);
    `);
  }
}
