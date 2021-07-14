import { MigrationInterface, QueryRunner } from 'typeorm';

export class M2ToKm2PUAreaSize1624025983610 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP VIEW countries;

        ALTER TABLE admin_regions drop COLUMN max_pu_area_size;

        ALTER TABLE admin_regions drop COLUMN min_pu_area_size;

        ALTER TABLE admin_regions
            ADD COLUMN max_pu_area_size DOUBLE PRECISION GENERATED ALWAYS AS ( CEIL((st_area(st_transform(the_geom, 3410))) / 1000000) ) STORED,
            ADD COLUMN min_pu_area_size DOUBLE PRECISION GENERATED ALWAYS AS ( CEIL((st_area(st_transform(the_geom, 3410)) / 589824 ) / 1000000) ) STORED;

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

        ALTER TABLE admin_regions drop COLUMN max_pu_area_size;

        ALTER TABLE admin_regions drop COLUMN min_pu_area_size;

        ALTER TABLE admin_regions
            ADD COLUMN max_pu_area_size DOUBLE PRECISION GENERATED ALWAYS AS ( st_area(st_transform(the_geom, 3410)) ) STORED,
            ADD COLUMN min_pu_area_size DOUBLE PRECISION GENERATED ALWAYS AS ( st_area(st_transform(the_geom, 3410)) / 589824 ) STORED;

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
