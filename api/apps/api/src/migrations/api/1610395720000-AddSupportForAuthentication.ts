import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgreSQLUtils } from '@marxan-api/utils/postgresql.utils';

export class AddSupportForAuthentication1610395720000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<any> {
    // Only CREATEDB privilege required in 13+ rather than SUPERUSER (ht @agnessa)
    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
CREATE EXTENSION IF NOT EXISTS pgcrypto;
      `);
    } else {
      Logger.warn(
        'The PostgreSQL extension `pgcrypto` is needed for the Marxan API but it was not possible to activate it. Please activate it manually (see setup documentation).',
      );
    }

    await queryRunner.query(`
ALTER TABLE users ADD COLUMN password_hash varchar(64) NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;
    `);

    await queryRunner.query(`
CREATE TABLE issued_authn_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL references users(id),
  exp timestamp without time zone NOT NULL,
  created_at timestamp NOT NULL default now()
);

CREATE INDEX issued_authn_tokens_user_id_idx ON issued_authn_tokens(user_id);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
DROP TABLE issued_authn_tokens;
    `);

    await queryRunner.query(`
ALTER TABLE users DROP COLUMN password_hash;
    `);

    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
DROP EXTENSION IF EXISTS pgcrypto;
      `);
    }
  }
}
