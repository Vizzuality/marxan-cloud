import { PostgreSQLUtils } from '@marxan-geoprocessing/utils/postgresql.utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialGeoDBSetup1611221157285 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Only CREATEDB privilege required in 13+ rather than SUPERUSER (ht @agnessa)
    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS tablefunc;
    CREATE EXTENSION IF NOT EXISTS plpgsql;
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_raster; -- OPTIONAL
    CREATE EXTENSION IF NOT EXISTS postgis_topology; -- OPTIONAL
      `);
    }

    await queryRunner.query(`

        CREATE TYPE "source_type" AS ENUM (
          'user_imported',
          'gbif',
          'iucn',
          'ecoregions',
          'intersection'
        );

        CREATE TYPE "shape_type" AS ENUM (
          'square',
          'hexagon',
          'irregular'
        );

        CREATE TYPE "job_status" AS ENUM (
          'created',
          'running',
          'done',
          'failure'
        );

        CREATE TYPE "adm_level" AS ENUM (
          'country',
          'adm_1',
          'adm_2'
        );

  -- Administrative regions table.
        CREATE TABLE "admin_regions" (
          "id" uuid DEFAULT gen_random_uuid(),
          "the_geom" geometry(MultiPolygon,4326) CONSTRAINT admin_regions_geometry_valid_check CHECK (ST_IsValid(the_geom)),
          "name_0" varchar,
          "name_1" varchar,
          "name_2" varchar,
          "iso3" varchar(3),
          "gid_0" varchar,
          "gid_1" varchar,
          "gid_2" varchar,
          "level" adm_level NOT NULL,
          "created_at" timestamp NOT NULL default now(),
          "created_by" uuid NOT NULL,
          "last_modified_at" timestamp NOT NULL default now(),

          primary key (id, level)
        ) PARTITION BY LIST(level);

        CREATE TABLE admin_regions_0 PARTITION OF admin_regions FOR VALUES IN ('country');
        CREATE TABLE admin_regions_1 PARTITION OF admin_regions FOR VALUES IN ('adm_1');
        CREATE TABLE admin_regions_2 PARTITION OF admin_regions FOR VALUES IN ('adm_2');

   -- Protected Areas table.
        CREATE TABLE "wdpa" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "wdpaid" float8,
          "the_geom" geometry(MultiPolygon, 4326) CONSTRAINT wdpa_geometry_valid_check CHECK (ST_IsValid(the_geom)),
          "full_name" varchar,
          "iucn_cat" varchar,
          "shape_leng" float8,
          "shape_area" float8,
          "iso3" varchar(3),
          "status" text,
          "desig" text,
          "created_at" timestamp NOT NULL default now(),
          "created_by" uuid NOT NULL,
          "last_modified_at" timestamp NOT NULL default now()
        );

  -- Features data table (will hold species and bioma data).
        CREATE TABLE "features_data" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "the_geom" geometry CONSTRAINT features_geometry_valid_check CHECK (ST_IsValid(the_geom)),
          "properties" jsonb,
          "source" source_type,
          "features_id" uuid
        );

  -- Usage of features data within scenarios table (will hold species and bioma data).
        CREATE TABLE "scenario_features_data" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "feature_class_id" uuid,
          "scenario_id" uuid,
          "total_area" float8,
          "current_pa" float8,
          "fpf" float8,
          "target" float8,
          "prop" float8,
          "target2" float8,
          "targetocc" float8,
          "sepnum" float8,
          "created_at" timestamp NOT NULL default now(),
          "created_by" uuid NOT NULL,
          "last_modified_at" timestamp NOT NULL default now()
        );

        -- Planning units geometry data table.
        CREATE TABLE "planning_units_geom" (
          "id" uuid DEFAULT gen_random_uuid(),
          "the_geom" geometry NOT NULL CONSTRAINT features_geometry_valid_check CHECK (ST_IsValid(the_geom)),
          "type" shape_type,
          "size" int,

          PRIMARY KEY (id, type),
          UNIQUE (the_geom, type)
        ) PARTITION BY LIST (type);

        CREATE TABLE planning_units_geom_square PARTITION OF planning_units_geom FOR VALUES IN ('square');
        CREATE TABLE planning_units_geom_hexagon PARTITION OF planning_units_geom FOR VALUES IN ('hexagon');
        CREATE TABLE planning_units_geom_irregular PARTITION OF planning_units_geom FOR VALUES IN ('irregular');

        -- Planning units usage by scenario.
        CREATE TABLE "scenarios_pu_data" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "pu_geom_id" uuid NOT NULL,
          "scenario_id" uuid NOT NULL,
          "puid" int NOT NULL,
          "lockin_status" int,
          "xloc" float8,
          "yloc" float8,
          "protected_area" float8
        );

        -- Cost data for planning units usage by scenario.
        CREATE TABLE "scenarios_pu_cost_data" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "output_results_data_id" uuid NOT NULL,
          "cost" float8
        );

        CREATE TABLE "output_results_data" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "puid" int,
          "scenario_id" uuid,
          "run_id" uuid,
          "value" float8,
          "missing_values" jsonb
        );

        CREATE INDEX admin_regions_geom_idx
        ON admin_regions
        USING GIST (the_geom);

        CREATE INDEX wdpa_geom_idx
        ON wdpa
        USING GIST (the_geom);

        CREATE INDEX features_data_geom_idx
        ON features_data
        USING GIST (the_geom);

        CREATE INDEX planning_units_geom_geom_idx
        ON planning_units_geom
        USING GIST (the_geom);

      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX admin_regions_geom_idx;
      DROP INDEX wdpa_geom_idx;
      DROP INDEX features_data_geom_idx;
      DROP INDEX planning_units_geom_geom_idx;

      DROP TABLE IF EXISTS "output_results_data";
      DROP TABLE IF EXISTS "scenarios_pu_cost_data";
      DROP TABLE IF EXISTS "scenarios_pu_data";
      DROP TABLE IF EXISTS "planning_units_geom";
      DROP TABLE IF EXISTS "scenario_features_data";
      DROP TABLE IF EXISTS "features_data";
      DROP TABLE IF EXISTS "wdpa";
      DROP TABLE IF EXISTS "admin_regions";

      DROP TYPE IF EXISTS source_type;
      DROP TYPE IF EXISTS shape_type;
      DROP TYPE IF EXISTS job_status;
      DROP TYPE IF EXISTS adm_level;
    `);

    // Only CREATEDB privilege required in 13+ rather than SUPERUSER (ht @agnessa)
    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
      DROP EXTENSION postgis_topology; -- OPTIONAL
      DROP EXTENSION postgis_raster; -- OPTIONAL
      DROP EXTENSION postgis;
      DROP EXTENSION plpgsql;
      DROP EXTENSION tablefunc;
      DROP EXTENSION uuid-ossp;
      `);
    }
  }
}
