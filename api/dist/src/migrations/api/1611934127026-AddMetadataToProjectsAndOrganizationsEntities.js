"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMetadataToProjectsAndOrganizationsEntities1611934127026 = void 0;
class AddMetadataToProjectsAndOrganizationsEntities1611934127026 {
    async up(queryRunner) {
        await queryRunner.query(`
ALTER TABLE organizations
  ADD COLUMN description text,
  ADD COLUMN metadata jsonb,
  ADD COLUMN created_by uuid NOT NULL REFERENCES users(id),
  ADD COLUMN last_modified_at timestamp without time zone NOT NULL DEFAULT now();

ALTER TABLE projects
  ADD COLUMN created_by uuid NOT NULL REFERENCES users(id),
  ADD COLUMN last_modified_at timestamp without time zone NOT NULL DEFAULT now();
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
ALTER TABLE organizations
  DROP COLUMN description,
  DROP COLUMN metadata,
  DROP COLUMN created_by,
  DROP COLUMN last_modified_at;

ALTER TABLE projects
  DROP COLUMN created_by,
  DROP COLUMN last_modified_at;
    `);
    }
}
exports.AddMetadataToProjectsAndOrganizationsEntities1611934127026 = AddMetadataToProjectsAndOrganizationsEntities1611934127026;
//# sourceMappingURL=1611934127026-AddMetadataToProjectsAndOrganizationsEntities.js.map