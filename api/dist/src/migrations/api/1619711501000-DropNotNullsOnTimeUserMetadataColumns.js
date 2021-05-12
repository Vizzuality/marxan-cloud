"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropNotNullsOnTimeUserMetadataColumns1619711501000 = void 0;
const uuid_1 = require("uuid");
class DropNotNullsOnTimeUserMetadataColumns1619711501000 {
    constructor() {
        this.tablesToAlter = ['organizations', 'projects', 'scenarios'];
    }
    async up(queryRunner) {
        await Promise.all(this.tablesToAlter.map((table) => {
            queryRunner.query(`
ALTER TABLE ${table}
  ALTER COLUMN created_at DROP NOT NULL,
  ALTER COLUMN last_modified_at DROP NOT NULL,
  ALTER COLUMN created_by DROP NOT NULL;
`);
        }));
    }
    async down(queryRunner) {
        const dummyUserEmailAddress = `${uuid_1.v4()}@example.com`;
        await queryRunner.query(`
INSERT INTO users
  (email, password_hash, display_name, is_active)
VALUES
  (${dummyUserEmailAddress}, crypt('${uuid_1.v4()}', gen_salt('bf')), 'Default owner for data imported via ETL jobs', false);
`);
        await Promise.all(this.tablesToAlter.map(async (table) => {
            await queryRunner.query(`
UPDATE ${table}
  SET created_by = (SELECT id FROM users WHERE email = '${dummyUserEmailAddress}')
  WHERE created_by IS NULL;

ALTER TABLE ${table}
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN last_modified_at SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL;
`);
        }));
    }
}
exports.DropNotNullsOnTimeUserMetadataColumns1619711501000 = DropNotNullsOnTimeUserMetadataColumns1619711501000;
//# sourceMappingURL=1619711501000-DropNotNullsOnTimeUserMetadataColumns.js.map