import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinMaxAreaSizeToCountries1623937649032
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP VIEW countries;
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP VIEW countries;
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
    bbox
  FROM admin_regions
  WHERE gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL
);
      `);
  }
}
