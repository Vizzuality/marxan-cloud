"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScenarioTableForProtectedAreaSelection1616764914000 = void 0;
class UpdateScenarioTableForProtectedAreaSelection1616764914000 {
    async up(queryRunner) {
        await queryRunner.query(`
ALTER TABLE scenarios
  RENAME COLUMN wdpa_filter TO protected_area_filter_by_ids;
ALTER TABLE scenarios
  ADD COLUMN wdpa_iucn_categories varchar[],
  ADD COLUMN custom_protected_area_ids uuid[];
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
ALTER TABLE scenarios
  RENAME COLUMN protected_area_filter_by_ids TO wdpa_filter;
ALTER TABLE scenarios
  DROP COLUMN wdpa_iucn_categories,
  DROP COLUMN custom_protected_area_ids;
    `);
    }
}
exports.UpdateScenarioTableForProtectedAreaSelection1616764914000 = UpdateScenarioTableForProtectedAreaSelection1616764914000;
//# sourceMappingURL=1616764914000-UpdateScenarioTableForProtectedAreaSelection.js.map