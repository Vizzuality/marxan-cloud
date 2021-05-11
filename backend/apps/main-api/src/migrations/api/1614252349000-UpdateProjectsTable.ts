import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Countries are handled in the geoprocessing db, as a view over the
 * admin_regions table, so we don't need this in the API db.
 */

export class UpdateProjectsTable1614252349000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TYPE planning_unit_grid_shape AS ENUM (
  'square',
  'hexagon',
  'from_shapefile'
);

ALTER TABLE projects
  DROP COLUMN admin_region_id,
  ADD COLUMN admin_area_l1_id varchar,
  ADD COLUMN admin_area_l2_id varchar,
  ADD COLUMN planning_unit_grid_shape planning_unit_grid_shape,
  ADD COLUMN planning_unit_area_km2 float
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE projects
  DROP COLUMN admin_area_l1_id,
  DROP COLUMN admin_area_l2_id,
  ADD COLUMN admin_region_id uuid,
  DROP COLUMN planning_unit_grid_type,
  DROP COLUMN planning_unit_area_km2;

DROP type planning_unit_grid_type;
`);
  }
}
