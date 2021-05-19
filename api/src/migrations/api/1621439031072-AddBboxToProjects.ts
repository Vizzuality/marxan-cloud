import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBboxToProjects1621439031072
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    -----------------------------------------
    -- Generates the new column we need
    -----------------------------------------
    ALTER TABLE projects ADD COLUMN bbox jsonb;

    UPDATE projects SET bbox = jsonb_build_array(ST_XMax(extent), ST_XMin(extent), ST_YMax(extent), ST_YMin(extent));

    -----------------------------------------
    -- tr_GetBbox()
    -- Utility func to populate bbox
    -----------------------------------------
    CREATE OR REPLACE FUNCTION tr_GetBbox()
    RETURNS trigger AS $BODY$
    BEGIN
      IF NEW.extent IS NOT NULL THEN
        NEW.bbox := jsonb_build_array(ST_XMax(NEW.extent), ST_XMin(NEW.extent), ST_YMax(NEW.extent), ST_YMin(NEW.extent));
      ELSE
        NEW.bbox := NULL;
      END IF;
      RETURN NEW;
    END;
    $BODY$ LANGUAGE plpgsql;
    -----------------------------------------
    -- Creates the trigger
    -----------------------------------------
    DROP TRIGGER IF EXISTS tr_projects_extent ON projects;

    CREATE TRIGGER tr_projects_extent
    BEFORE INSERT or UPDATE ON projects
    FOR EACH ROW EXECUTE
    PROCEDURE tr_GetBbox();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.query(`
     DROP TRIGGER IF EXISTS tr_projects_extent ON projects;
     ALTER TABLE projects
     DROP COLUMN bbox;
     `);
  }
}
