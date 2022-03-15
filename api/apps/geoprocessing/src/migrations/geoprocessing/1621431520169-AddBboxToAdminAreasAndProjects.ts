import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddBboxToAdminAreasAndProjects1621431520169
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    -----------------------------------------
    -- Generates the new column we need
    -----------------------------------------
    ALTER TABLE admin_regions ADD COLUMN bbox jsonb;

    UPDATE admin_regions SET bbox = jsonb_build_array(ST_XMax(the_geom), ST_XMin(the_geom), ST_YMax(the_geom), ST_YMin(the_geom));

    -----------------------------------------
    -- tr_GetBbox()
    -- Utility func to populate bbox
    -----------------------------------------
    CREATE OR REPLACE FUNCTION tr_GetBbox()
    RETURNS trigger AS $BODY$
    BEGIN
      NEW.bbox := jsonb_build_array(ST_XMax(NEW.the_geom), ST_XMin(NEW.the_geom), ST_YMax(NEW.the_geom), ST_YMin(NEW.the_geom));
      RETURN NEW;
    END;
    $BODY$ LANGUAGE plpgsql;
    -----------------------------------------
    -- Creates the trigger
    -----------------------------------------
    DROP TRIGGER IF EXISTS tr_adminRegions_the_geom ON admin_regions;

    CREATE TRIGGER tr_adminRegions_the_geom
    BEFORE INSERT or UPDATE ON admin_regions
    FOR EACH ROW EXECUTE
    PROCEDURE tr_GetBbox();

    -----------------------------------------
    -- Recreates the countries view
    -----------------------------------------
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP TRIGGER IF EXISTS tr_adminRegions_the_geom ON admin_regions;
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
    ALTER TABLE admin_regions DROP COLUMN bbox;

     `);
  }
}
