"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectsTable1614252349000 = void 0;
class UpdateProjectsTable1614252349000 {
    async up(queryRunner) {
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
    async down(queryRunner) {
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
exports.UpdateProjectsTable1614252349000 = UpdateProjectsTable1614252349000;
//# sourceMappingURL=1614252349000-UpdateProjectsTable.js.map