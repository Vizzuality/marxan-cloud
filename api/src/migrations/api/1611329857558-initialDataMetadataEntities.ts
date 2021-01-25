import {MigrationInterface, QueryRunner} from "typeorm";

export class initialDataMetadataEntities1611329857558 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      CREATE TYPE "status" AS ENUM (
        'created',
        'running',
        'done',
        'failure'
      );

      CREATE TYPE "tags" AS ENUM (
        'bioregional',
        'species'
      );

      CREATE TABLE "features" (
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

      CREATE TABLE "scenarios" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "full_name" varchar,
        "project_id" varchar REFERENCES "projects" ("id"),
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL,
        "modify_at" timestamp NOT NULL default now(),
        "iso3" varchar(3),
        "extent" geometry,
        "admin_region_id" uuid,
        "status" status,
        "parent_id" uuid REFERENCES "scenarios" ("id"),
      );

      CREATE TABLE "output_results" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "scenario_id" uuid REFERENCES "scenarios" ("id"),
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

      ALTER TABLE "features_metadata" ADD FOREIGN KEY ("feature_data_id") REFERENCES "features_data" ("id");
      ALTER TABLE "scenarios_metadata" ADD FOREIGN KEY ("admin_region_id") REFERENCES "admin_regions_0" ("id");
      ALTER TABLE "output_results_metadata" ADD FOREIGN KEY ("scenario_id") REFERENCES "scenarios_metadata" ("id");
      ALTER TABLE "scenarios_metadata" ADD FOREIGN KEY ("country_code") REFERENCES "admin_regions_0" ("iso3");
      ALTER TABLE "scenarios_metadata" ADD FOREIGN KEY ("parent_id") REFERENCES "scenarios_metadata" ("id");


      COMMENT ON TABLE "features" IS 'Feature management';
      COMMENT ON COLUMN "features"."property_name" IS 'properties.<column> used for setting conservation Feature type';
      COMMENT ON TABLE "output_results" IS 'output_results metadata from marxan runs under an scenario';
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      DROP TABLE IF EXISTS "features";
      DROP TABLE IF EXISTS "scenarios";
      DROP TABLE IF EXISTS "output_results";


      DROP TYPE IF EXISTS tags;
      DROP TYPE IF EXISTS status;

      `)
    }

}
