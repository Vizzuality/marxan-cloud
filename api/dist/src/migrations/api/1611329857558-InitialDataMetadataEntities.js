"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialDataMetadataEntities1611329857558 = void 0;
class InitialDataMetadataEntities1611329857558 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TYPE "job_status" AS ENUM (
        'created',
        'running',
        'done',
        'failure'
      );

      CREATE TYPE "features_tags" AS ENUM (
        'bioregional',
        'species'
      );

      CREATE TABLE "features" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "feature_class_name" varchar,
        "alias" varchar,
        "description" varchar,
        "property_name" varchar,
        "intersection" uuid[],
        "tag" features_tags NOT NULL,
        "creation_status" job_status NOT NULL,
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL REFERENCES "users" ("id"),
        "last_modified_at" timestamp NOT NULL default now()
      );

      CREATE TABLE "scenarios" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar,
        "project_id" uuid NOT NULL REFERENCES "projects" ("id"),
        "country_id" varchar(3) NOT NULL,
        "extent" geometry NOT NULL,
        "wdpa_filter" jsonb default NULL,
        "wdpa_threshold" int CHECK (wdpa_threshold BETWEEN 0 AND 100),
        "admin_region_id" uuid,
        "number_of_runs" int NOT NULL,
        "blm" float8 NOT NULL,
        "metadata" jsonb,
        "status" job_status NOT NULL,
        "parent_id" uuid REFERENCES "scenarios" ("id"),
        "created_at" timestamp NOT NULL default now(),
        "created_by" uuid NOT NULL REFERENCES "users" ("id"),
        "last_modified_at" timestamp NOT NULL default now()
      );

      CREATE TABLE "output_results" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "scenarios_id" uuid REFERENCES "scenarios" ("id"),
        "run_id" int,
        "score" float8,
        "cost" float8,
        "planning_units" float8,
        "connectivity" float8,
        "connectivity_total" float8,
        "mpm" float8,
        "penalty" float8,
        "shortfall" float8,
        "missing_values" float8,
        "metadata" jsonb
      );
      `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP TABLE IF EXISTS "features";
      DROP TABLE IF EXISTS "output_results";
      DROP TABLE IF EXISTS "scenarios";

      DROP TYPE IF EXISTS features_tags;
      DROP TYPE IF EXISTS job_status;
      `);
    }
}
exports.InitialDataMetadataEntities1611329857558 = InitialDataMetadataEntities1611329857558;
//# sourceMappingURL=1611329857558-InitialDataMetadataEntities.js.map