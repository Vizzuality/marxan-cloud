"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCascadeToAllowDeletingProjectsWithScenarios1616155304000 = void 0;
class AddCascadeToAllowDeletingProjectsWithScenarios1616155304000 {
    async up(queryRunner) {
        await queryRunner.query(`
ALTER TABLE scenarios
  DROP CONSTRAINT scenarios_project_id_fkey,
  ADD CONSTRAINT scenarios_project_id_fkey
    FOREIGN KEY (project_id)
    REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
ALTER TABLE scenarios
  DROP CONSTRAINT scenarios_project_id_fkey,
  ADD CONSTRAINT scenarios_project_id_fkey
    FOREIGN KEY (project_id)
    REFERENCES projects(id);
    `);
    }
}
exports.AddCascadeToAllowDeletingProjectsWithScenarios1616155304000 = AddCascadeToAllowDeletingProjectsWithScenarios1616155304000;
//# sourceMappingURL=1616155304000-AddCascadeToAllowDeletingProjectsWithScenarios.migration.js.map