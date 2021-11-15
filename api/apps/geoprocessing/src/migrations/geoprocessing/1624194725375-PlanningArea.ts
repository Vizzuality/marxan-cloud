import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlanningArea1624194725375 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
CREATE TABLE planning_areas (
  id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT now(),
  project_id uuid,
  the_geom geometry(MultiPolygon, 4326) NOT NULL CONSTRAINT planning_area_the_geom_check CHECK (ST_IsValid(the_geom)),
  bbox jsonb GENERATED ALWAYS AS (
    ('[' ||
      ST_XMax(the_geom)::text || ',' ||
      ST_XMin(the_geom)::text || ',' ||
      ST_YMax(the_geom)::text || ',' ||
      ST_YMin(the_geom)::text ||
    ']')::jsonb
  ) STORED
);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP TABLE planning_areas;
`);
  }
}
