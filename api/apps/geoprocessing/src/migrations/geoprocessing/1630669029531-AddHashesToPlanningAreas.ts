import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHashesToPlanningAreas1630669029531
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table admin_regions
          add column hash text generated always as ( md5(the_geom::bytea) ) stored;
      alter table planning_areas
          add column hash text generated always as ( md5(the_geom::bytea) ) stored;
      create index on admin_regions(hash);
      create index on planning_areas(hash);
      drop view countries;

      CREATE VIEW countries AS (
        SELECT
          id,
          gid_0,
          name_0,
          the_geom,
          level,
          iso3,
          created_at,
          created_by,
          last_modified_at,
          bbox,
          max_pu_area_size,
          min_pu_area_size,
          hash
        FROM admin_regions
        WHERE gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table planning_areas
        drop column hash;
      drop view countries;
      alter table admin_regions
        drop column hash;

      CREATE VIEW countries AS (
        SELECT
          id,
          gid_0,
          name_0,
          the_geom,
          level,
          iso3,
          created_at,
          created_by,
          last_modified_at,
          bbox,
          max_pu_area_size,
          min_pu_area_size
        FROM admin_regions
        WHERE gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL
      );
    `);
  }
}
