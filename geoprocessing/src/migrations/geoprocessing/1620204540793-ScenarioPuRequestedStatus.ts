import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioPuRequestedStatus1620204540793
  implements MigrationInterface {
  name = 'ScenarioPuRequestedStatus1620204540793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "scenario_pu_requested_status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "scenario_id" character varying NOT NULL, "included_planning_unit_ids" text NOT NULL DEFAULT '', "excluded_planning_unit_ids" text NOT NULL DEFAULT '', "included_from_geojson" geometry(MultiPolygon,4326), "included_from_shapefile" geometry(MultiPolygon,4326), "excluded_from_geojson" geometry(MultiPolygon,4326), "excluded_from_shapefile" geometry(MultiPolygon,4326), CONSTRAINT "scenario_included_pu_geojson_valid_check" CHECK (ST_IsValid(included_from_geojson)), CONSTRAINT "scenario_included_pu_shapefile_valid_check" CHECK (ST_IsValid(included_from_shapefile)), CONSTRAINT "scenario_excluded_pu_geojson_valid_check" CHECK (ST_IsValid(excluded_from_geojson)), CONSTRAINT "scenario_excluded_pu_shapefile_valid_check" CHECK (ST_IsValid(excluded_from_shapefile)), CONSTRAINT "PK_cd23f24dfce04b5c64cd7179c6d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "scenario_pu_requested_status"`);
  }
}
