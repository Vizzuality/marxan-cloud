import {MigrationInterface, QueryRunner} from "typeorm";

export class initialGeoDBSetup1611221157285 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS tablefunc;
      CREATE EXTENSION IF NOT EXISTS plpgsql;
      CREATE EXTENSION IF NOT EXISTS postgis;
      CREATE EXTENSION IF NOT EXISTS postgis_raster; -- OPTIONAL
      CREATE EXTENSION IF NOT EXISTS postgis_topology; -- OPTIONAL

      CREATE TYPE "source_type" AS ENUM (
        'user_imported',
        'gbif',
        'uicn',
        'ecoregions',
        'intersection'
      );

      CREATE TYPE "shape_type" AS ENUM (
        'square',
        'hexagon',
        'irregular'
      );

      CREATE TYPE "ingestion_status" AS ENUM (
        'created',
        'running',
        'done',
        'failure'
      );

      CREATE TYPE "adm_level" AS ENUM (
        0,
        1,
        2
      );

-- Administrative regions table.
      CREATE TABLE "admin_regions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ogc_fid" int NOT NULL,
        "the_geom" geometry CONSTRAINT admin_regions_geometry_valid_check CHECK (ST_IsValid(the_geom)),
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
        "last_modified_at" timestamp NOT NULL default now()
      ) PARTITION BY LIST(level);

      CREATE TABLE admin_regions_0 PARTITION OF admin_regions FOR VALUES IN (0);
      CREATE TABLE admin_regions_1 PARTITION OF admin_regions FOR VALUES IN (1);
      CREATE TABLE admin_regions_2 PARTITION OF admin_regions FOR VALUES IN (2);

      -- Protected Areas table.
      CREATE TABLE "wdpa" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "wdpaid" float8,
        "the_geom" geometry CONSTRAINT wdpa_geometry_valid_check CHECK (ST_IsValid(the_geom)),
        "full_name" varchar,
        "iucn_cat" varchar,
        "shape_leng" float8,
        "shape_area" float8,
        "iso3" varchar(3) REFERENCES "admin_regions" ("iso3"),
        "status" text,
        "desig" text,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "last_modified_at" timestamp NOT NULL default now()
      );

      -- Features data table (will hold species and bioma data).
      CREATE TABLE "features_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "the_geom" geometry CONSTRAINT features_geometry_valid_check CHECK (ST_IsValid(the_geom)),
        "properties" jsonb,
        "source" source_type,
        "features_id" uuid
      ) PARTITION BY LIST (source);

      -- Usage of features data within scenarios table (will hold species and bioma data).
      CREATE TABLE "scenario_features_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "feature_class_id" uuid,
        "scenario_id" uuid,
        "total_area" varchar,
        "admin_area" timestamp,
        "current_pa" source_type,
        "spf" float8,
        "target" float8,
        "target2" float8,
        "targetocc" float8,
        "sepnum" float8,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "last_modified_at" timestamp NOT NULL default now()
      );

      -- Planning units geometry data table.
      CREATE TABLE "planning_units_geom" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "the_geom" geometry UNIQUE NOT NULL CONSTRAINT features_geometry_valid_check CHECK (ST_IsValid(the_geom)),
        "type" shape_type,
        "size" int
      ) PARTITION BY LIST (type);

      CREATE TABLE planing_units_geom_square PARTITION OF planing_units_geom FOR VALUES IN ('square');
      CREATE TABLE planing_units_geom_hexagon PARTITION OF planing_units_geom FOR VALUES IN ('hexagon');
      CREATE TABLE planing_units_geom_irregular PARTITION OF planing_units_geom FOR VALUES IN ('irregular');

      -- Planning units usage by scenario.
      CREATE TABLE "scenarios_pu_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "pu_geomid" uuid NOT NULL REFERENCES "planning_units_geom" ("id"),
        "scenario_id" uuid NOT NULL,
        "puid" int NOT NULL,
        "lockin_status" int,
        "xloc" float8,
        "yloc" float8,
        "protected_area" float8
      );

      -- Cost data for planning units usage by scenario.
      CREATE TABLE "scenarios_pu_cost_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "output_results_data_id" uuid NOT NULL REFERENCES "scenarios_pu_data" ("id"),
        "cost" float8
      );

      CREATE TABLE "output_results_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "puid" int REFERENCES "scenarios_pu_data" ("puid"),
        "scenario_id" uuid,
        "run_id" uuid,
        "value" float8,
        "missing_values" jsonb
      );

      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
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
      DROP TYPE IF EXISTS ingestion_status;
      DROP TYPE IF EXISTS adm_level;

      DROP EXTENSION postgis_topology; -- OPTIONAL
      DROP EXTENSION postgis_raster; -- OPTIONAL
      DROP EXTENSION postgis;
      DROP EXTENSION plpgsql;
      DROP EXTENSION tablefunc;
      DROP EXTENSION uuid-ossp;
      `);
    }

}
