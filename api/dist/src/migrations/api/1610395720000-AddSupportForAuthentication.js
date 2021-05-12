"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSupportForAuthentication1610395720000 = void 0;
const common_1 = require("@nestjs/common");
const postgresql_utils_1 = require("../../utils/postgresql.utils");
class AddSupportForAuthentication1610395720000 {
    async up(queryRunner) {
        if (await postgresql_utils_1.PostgreSQLUtils.version13Plus()) {
            await queryRunner.query(`
CREATE EXTENSION IF NOT EXISTS pgcrypto;
      `);
        }
        else {
            common_1.Logger.warn('The PostgreSQL extension `pgcrypto` is needed for the Marxan API but it was not possible to activate it. Please activate it manually (see setup documentation).');
        }
        await queryRunner.query(`
ALTER TABLE users ADD COLUMN password_hash varchar(64) NOT NULL DEFAULT uuid_generate_v4();
ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;
    `);
        await queryRunner.query(`
CREATE TABLE issued_authn_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL references users(id),
  exp timestamp without time zone NOT NULL,
  created_at timestamp NOT NULL default now()
);

CREATE INDEX issued_authn_tokens_user_id_idx ON issued_authn_tokens(user_id);
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
DROP TABLE issued_authn_tokens;
    `);
        await queryRunner.query(`
ALTER TABLE users DROP COLUMN password_hash;
    `);
        if (await postgresql_utils_1.PostgreSQLUtils.version13Plus()) {
            await queryRunner.query(`
DROP EXTENSION IF EXISTS pgcrypto;
      `);
        }
    }
}
exports.AddSupportForAuthentication1610395720000 = AddSupportForAuthentication1610395720000;
//# sourceMappingURL=1610395720000-AddSupportForAuthentication.js.map