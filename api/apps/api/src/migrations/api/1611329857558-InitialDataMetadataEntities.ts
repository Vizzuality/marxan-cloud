import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDataMetadataEntities1611329857558
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "features";
      DROP TABLE IF EXISTS "output_results";
      DROP TABLE IF EXISTS "scenarios";

      DROP TYPE IF EXISTS features_tags;
      DROP TYPE IF EXISTS job_status;
      `);
  }
}
