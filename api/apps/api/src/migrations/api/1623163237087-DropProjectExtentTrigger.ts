import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProjectExtentTrigger1623163237087
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP TRIGGER IF EXISTS tr_projects_extent ON projects;
    DROP FUNCTION tr_GetBbox();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    -----------------------------------------
    -- tr_GetBbox() from 1621439031072-AddBboxToProjects.ts
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

    CREATE TRIGGER tr_projects_extent
    BEFORE INSERT or UPDATE ON projects
    FOR EACH ROW EXECUTE
    PROCEDURE tr_GetBbox();
     `);
  }
}
