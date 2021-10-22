import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUniquenessOfPuGeoms1635234406913 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from planning_units_geom a
      using planning_units_geom b
      where
            a.id < b.id and 
            a.size = b.size and 
            a.the_geom = b.the_geom and 
            (a.project_id = b.project_id or a.project_id is null and b.project_id is null);

      alter table planning_units_geom
        drop constraint planning_units_geom_the_geom_type_key;

      create unique index planning_units_geom_the_geom_type_project_id_check
        on planning_units_geom(the_geom, type, coalesce(project_id, '00000000-0000-0000-0000-000000000000'));

      alter table planning_units_geom
        add constraint planning_units_geom_no_null_project_id
          check (project_id <> '00000000-0000-0000-0000-000000000000');
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table planning_units_geom
        drop constraint planning_units_geom_no_null_project_id;

      drop index planning_units_geom_the_geom_type_project_id_check;

      alter table planning_units_geom
        add constraint planning_units_geom_the_geom_type_key
          unique (the_geom, type, project_id);
    `);
  }
}
