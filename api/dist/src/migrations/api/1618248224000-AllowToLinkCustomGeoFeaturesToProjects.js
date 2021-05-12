"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDraftStatusToJobStatusEnum1618241224000 = void 0;
class AddDraftStatusToJobStatusEnum1618241224000 {
    async up(queryRunner) {
        await queryRunner.query(`
ALTER TYPE job_status ADD VALUE 'draft';
    `);
    }
    async down(_queryRunner) {
    }
}
exports.AddDraftStatusToJobStatusEnum1618241224000 = AddDraftStatusToJobStatusEnum1618241224000;
//# sourceMappingURL=1618248224000-AllowToLinkCustomGeoFeaturesToProjects.js.map