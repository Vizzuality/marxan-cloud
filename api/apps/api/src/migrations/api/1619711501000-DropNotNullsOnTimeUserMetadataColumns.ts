import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

export class DropNotNullsOnTimeUserMetadataColumns1619711501000
  implements MigrationInterface
{
  private tablesToAlter = ['organizations', 'projects', 'scenarios'];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      this.tablesToAlter.map((table) => {
        queryRunner.query(`
ALTER TABLE ${table}
  ALTER COLUMN created_at DROP NOT NULL,
  ALTER COLUMN last_modified_at DROP NOT NULL,
  ALTER COLUMN created_by DROP NOT NULL;
`);
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * We first create a dummy user to whom to associate data with no owner so
     * that the following ALTER TABLE can succeed. This may in fact never be
     * needed, and it is an arbitrary association of "orphaned" data, but just
     * in case...
     */
    const dummyUserEmailAddress = `${v4()}@example.com`;
    await queryRunner.query(`
INSERT INTO users
  (email, password_hash, display_name, is_active)
VALUES
  (${dummyUserEmailAddress}, crypt('${v4()}', gen_salt('bf')), 'Default owner for data imported via ETL jobs', false);
`);
    await Promise.all(
      this.tablesToAlter.map(async (table) => {
        await queryRunner.query(`
UPDATE ${table}
  SET created_by = (SELECT id FROM users WHERE email = '${dummyUserEmailAddress}')
  WHERE created_by IS NULL;

ALTER TABLE ${table}
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN last_modified_at SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL;
`);
      }),
    );
  }
}
