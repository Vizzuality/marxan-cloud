import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdToCountriesView1616690947000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
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
    last_modified_at
  FROM admin_regions
  WHERE gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL
);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
DROP VIEW countries;

CREATE VIEW countries AS (
  SELECT
    gid_0,
    name_0,
    the_geom
  FROM admin_regions
  WHERE gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL
);
    `);
  }
}
