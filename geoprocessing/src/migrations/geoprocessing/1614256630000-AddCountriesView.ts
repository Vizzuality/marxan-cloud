import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountriesView1614256630000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE UNIQUE INDEX only_countries_by_gid ON admin_regions(gid_0) WHERE (gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL);
CREATE UNIQUE INDEX only_countries_by_name ON admin_regions(name_0) WHERE (name_0 IS NOT NULL AND name_1 IS NULL AND name_2 IS NULL);
CREATE VIEW countries AS (
  SELECT
    ogc_fid,
    gid_0,
    name_0,
    the_geom
  FROM admin_regions
  WHERE gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL
);
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP VIEW countries;
DROP INDEX only_countries_by_gid;
DROP INDEX only_countries_by_name;
`);
  }
}
