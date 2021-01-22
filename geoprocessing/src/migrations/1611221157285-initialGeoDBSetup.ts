import {MigrationInterface, QueryRunner} from "typeorm";

export class initialGeoDBSetup1611221157285 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS tablefunc;
      CREATE EXTENSION IF NOT EXISTS postgis;
      CREATE EXTENSION IF NOT EXISTS postgis_topology;

      CREATE TYPE "source_type" AS ENUM (
        'user_imported',
        'gbif',
        'uicn',
        'ecoregions',
        'intersection'
      );

      CREATE TYPE "tags" AS ENUM (
        'bioregional',
        'species'
      );

      CREATE TYPE "shape_type" AS ENUM (
        'square',
        'hexagon',
        'irregular',
        'user_imported'
      );

      CREATE TYPE "status" AS ENUM (
        'created',
        'running',
        'done',
        'failure'
      );

      CREATE TABLE "wdpa" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "geometry" geometry,
        "full_name" varchar,
        "wdpaid" float8,
        "iucn_cat" varchar,
        "shape_leng" float8,
        "shape_area" float8,
        "iso3" varchar(3),
        "status" text,
        "desig" text,
        "creation_status" status NOT NULL,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "modify_at" timestamp NOT NULL default now()
      );

      CREATE TABLE "admin_regions_0" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ogc_fid" int NOT NULL,
        "geometry" geometry NOT NULL,
        "name_0" varchar NOT NULL,
        "gid_0" varchar NOT NULL,
        "iso3" varchar NOT NULL,
        "iso2" varchar NOT NULL,
        "creation_status" status NOT NULL,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "modify_at" timestamp NOT NULL default now()
      );

      CREATE TABLE "admin_regions_1" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ogc_fid" int NOT NULL,
        "geometry" geometry NOT NULL,
        "name_1" varchar NOT NULL,
        "gid_0" varchar NOT NULL,
        "gid_1" varchar NOT NULL,
        "creation_status" status NOT NULL,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "modify_at" timestamp NOT NULL default now()
      );

      CREATE TABLE "admin_regions_2" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ogc_fid" int NOT NULL,
        "name_2" varchar NOT NULL,
        "gid_0" varchar NOT NULL,
        "gid_1" varchar NOT NULL,
        "gid_2" varchar NOT NULL,
        "creation_status" status NOT NULL,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "modify_at" timestamp NOT NULL default now()
      );

      CREATE TABLE "features_metadata" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "feature_data_id" uuid NOT NULL,
        "feature_class_name" varchar,
        "alias" varchar,
        "description" varchar,
        "property_name" varchar,
        "intersection" uuid[],
        "tag" tags NOT NULL,
        "creation_status" status NOT NULL,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "modify_at" timestamp NOT NULL default now()
      );

      CREATE TABLE "features_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "geometry" geometry,
        "properties" jsonb,
        "source" source_type
      );

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
        "modify_at" timestamp NOT NULL default now()
      );

      CREATE TABLE "planing_units_geom" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "geometry" geometry,
        "type" shape_type,
        "size" int
      );

      CREATE TABLE "scenarios_metadata" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "full_name" varchar,
        "sce_id" varchar,
        "project_id" varchar,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "modify_at" timestamp NOT NULL default now(),
        "country_code" varchar,
        "extent" geometry,
        "admin_region_id" uuid,
        "status" status,
        "parent_id" uuid
      );

      CREATE TABLE "scenarios_pu_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "pu_geomid" uuid NOT NULL,
        "scenario_id" uuid NOT NULL,
        "puid" int NOT NULL,
        "lockin_status" int,
        "xloc" float8,
        "yloc" float8
      );

      CREATE TABLE "scenarios_pu_cost_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "output_results_data_id" uuid,
        "cost" float8
      );

      CREATE TABLE "output_results_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "puid" int,
        "scenario_id" uuid,
        "run_id" uuid,
        "value" float8,
        "missing_values" jsonb
      );

      CREATE TABLE "output_results_metadata" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "scenario_id" uuid,
        "run_number" int,
        "score" float8,
        "cost" float8,
        "planing_units" float8,
        "connectivity" float8,
        "connectivity_total" float8,
        "mpm" float8,
        "penalty" float8,
        "shortfall" float8,
        "missing_values" float8,
        "aditional_fields" jsonb
      );



      ALTER TABLE "scenario_features_data" ADD FOREIGN KEY ("feature_class_id") REFERENCES "features_metadata" ("id");
      ALTER TABLE "scenario_features_data" ADD FOREIGN KEY ("scenario_id") REFERENCES "scenarios_metadata" ("id");
      ALTER TABLE "output_results_data" ADD FOREIGN KEY ("scenario_id") REFERENCES "scenarios_metadata" ("id");
      ALTER TABLE "scenarios_pu_data" ADD FOREIGN KEY ("pu_geomid") REFERENCES "planing_units_geom" ("id");
      ALTER TABLE "output_results_data" ADD FOREIGN KEY ("puid") REFERENCES "scenarios_pu_data" ("puid");
      ALTER TABLE "scenarios_pu_data" ADD FOREIGN KEY ("scenario_id") REFERENCES "scenarios_metadata" ("id");
      ALTER TABLE "output_results_data" ADD FOREIGN KEY ("run_id") REFERENCES "output_results_metadata" ("id");
      ALTER TABLE "features_metadata" ADD FOREIGN KEY ("feature_data_id") REFERENCES "features_data" ("id");
      ALTER TABLE "scenarios_metadata" ADD FOREIGN KEY ("admin_region_id") REFERENCES "admin_regions_0" ("id");
      ALTER TABLE "output_results_metadata" ADD FOREIGN KEY ("scenario_id") REFERENCES "scenarios_metadata" ("id");
      ALTER TABLE "wdpa" ADD FOREIGN KEY ("iso3") REFERENCES "admin_regions_0" ("iso3");
      ALTER TABLE "scenarios_metadata" ADD FOREIGN KEY ("country_code") REFERENCES "admin_regions_0" ("iso3");
      ALTER TABLE "scenarios_metadata" ADD FOREIGN KEY ("parent_id") REFERENCES "scenarios_metadata" ("id");
      ALTER TABLE "scenarios_pu_cost_data" ADD FOREIGN KEY ("output_results_data_id") REFERENCES "output_results_data" ("id");
      ALTER TABLE "projects" ADD FOREIGN KEY ("country_code") REFERENCES "admin_regions_0" ("iso3");

      COMMENT ON TABLE "admin_regions_0" IS 'will cover adm0';
      COMMENT ON TABLE "admin_regions_1" IS 'will cover adm0 and adm1';
      COMMENT ON TABLE "admin_regions_2" IS 'will cover adm0,adm1 and adm2';
      COMMENT ON TABLE "features_metadata" IS 'Feature management';
      COMMENT ON COLUMN "features_metadata"."property_name" IS 'properties.<column> used for setting conservation Feature type';
      COMMENT ON TABLE "features_data" IS 'For geometry storage';
      COMMENT ON COLUMN "features_data"."properties" IS 'Either have the properties as a jsonb or as columns on this tables';
      COMMENT ON COLUMN "planing_units_geom"."size" IS 'represent km';
      COMMENT ON TABLE "scenarios_pu_data" IS 'marxan view from an output_results';
      COMMENT ON TABLE "scenarios_pu_cost_data" IS 'marxan view from an output_results';
      COMMENT ON TABLE "output_results_data" IS 'output_results from marxan runs under an scenario';
      COMMENT ON TABLE "output_results_metadata" IS 'output_results metadata from marxan runs under an scenario';

      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      DROP TABLE IF EXISTS "output_results_metadata";
      DROP TABLE IF EXISTS "output_results_data";
      DROP TABLE IF EXISTS "scenarios_pu_cost_data";
      DROP TABLE IF EXISTS "scenarios_pu_data";
      DROP TABLE IF EXISTS "scenarios_metadata";
      DROP TABLE IF EXISTS "planing_units_geom";
      DROP TABLE IF EXISTS "scenario_features_data";
      DROP TABLE IF EXISTS "features_data";
      DROP TABLE IF EXISTS "features_metadata";
      DROP TABLE IF EXISTS "admin_regions_2";
      DROP TABLE IF EXISTS "admin_regions_1";
      DROP TABLE IF EXISTS "admin_regions_0";
      DROP TABLE IF EXISTS "wdpa";


      DROP TYPE IF EXISTS source_type;
      DROP TYPE IF EXISTS tags;
      DROP TYPE IF EXISTS shape_type;
      DROP TYPE IF EXISTS status;

      DROP EXTENSION postgis_topology;
      DROP EXTENSION postgis;
      DROP EXTENSION tablefunc;
      DROP EXTENSION uuid-ossp;
      `);
    }

}
