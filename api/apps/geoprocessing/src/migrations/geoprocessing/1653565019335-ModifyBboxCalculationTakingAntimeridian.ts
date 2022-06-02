import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyBboxCalculationTakingAntimeridian1653565019335
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION mx_bbox2json(geom geometry)
    returns jsonb
    language plpgsql
   as
    $function$
    DECLARE
    -- variable declaration
        both_hemispheres RECORD;
    BEGIN
      -- logic https://github.com/mapbox/carmen/blob/03fac2d7397ecdfcb4f0828fcfd9d8a54c845f21/lib/util/bbox.js#L59
      -- json form of the bbox should be in Nominatim bbox  [xmin, xmax, ymin, ymax] [W, E, S, N].
        execute 'with region as (select st_intersection($1, geom) as the_geom,
                  st_intersects($1, geom) intersects, pos
                from (values (ST_MakeEnvelope(-180, -90, 0, 90, 4326), ''west''),
                        (ST_MakeEnvelope(0, -90, 180, 90, 4326), ''east'')) as t(geom, pos)),
          data as (select ST_XMax(the_geom), ST_XMin(the_geom),
              ST_YMax(the_geom),ST_YMin(the_geom), pos, intersects,
              ST_XMax(the_geom) + ABS(lag(ST_XMin(the_geom), 1) OVER ())  >
              (180 - ST_XMin(the_geom)) + (180 - ABS(lag(ST_XMax(the_geom), 1) OVER ())) as pm_am
              from region)
          select bool_and(intersects) and bool_and(pm_am) result,
                jsonb_build_array(max(st_xmax), min(st_xmin), max(st_ymax), min(st_ymin)) if_false,
                jsonb_build_array(min(st_xmax), max(st_xmin), max(st_ymax), min(st_ymin))if_true from data;'
        into both_hemispheres
        using geom;
        if both_hemispheres.result then
          return both_hemispheres.if_true;
        else
          return both_hemispheres.if_false;
        end if;
    end;
    $function$;

    CREATE OR REPLACE FUNCTION public.tr_getbbox()
      RETURNS trigger
      LANGUAGE plpgsql
    AS $function$
        BEGIN
          NEW.bbox := mx_bbox2json(NEW.the_geom);
          RETURN NEW;
        END;
    $function$;

    UPDATE admin_regions SET id = id;
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION public.tr_getbbox()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
        BEGIN
          NEW.bbox := jsonb_build_array(ST_XMax(NEW.the_geom), ST_XMin(NEW.the_geom),
                                        ST_YMax(NEW.the_geom), ST_YMin(NEW.the_geom));
          RETURN NEW;
        END;
    $function$;

    Drop FUNCTION mx_bbox2json(geom geometry);

    UPDATE admin_regions SET id = id;
          `);
  }
}
