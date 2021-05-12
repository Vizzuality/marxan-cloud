"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialDBSetup1608149577000 = void 0;
class InitialDBSetup1608149577000 {
    async up(queryRunner) {
        await queryRunner.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      email varchar NOT NULL,
      fname varchar,
      lname varchar,
      created_at timestamp
    );

      `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
    DROP TABLE IF EXISTS users;

    DROP EXTENSION IF EXISTS "uuid-ossp";
    `);
    }
}
exports.InitialDBSetup1608149577000 = InitialDBSetup1608149577000;
//# sourceMappingURL=1608149577000-InitialDBSetup.migration.js.map