import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenIdColumnToLocks1645026803969
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      -- forcibly remove all locks first in order to avoid possible constraint
      -- violations when setting up a FK at the next step.
      -- Sorry, active users! but there shouldn't really be any of you (active)
      -- by the time this migration runs - at least there's no production
      -- environment yet 😇).
      DELETE FROM scenario_locks;
      -- then go ahead with the actual core of the migration
      ALTER TABLE "scenario_locks"
      ADD COLUMN token_id uuid references issued_authn_tokens(id) ON DELETE CASCADE,
      DROP CONSTRAINT scenario_locks_pk,
      ADD CONSTRAINT scenario_locks_pk PRIMARY KEY (scenario_id, user_id, token_id);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenario_locks"
      DROP COLUMN token_id,
      DROP CONSTRAINT scenario_locks_pk,
      ADD CONSTRAINT scenario_locks_pk PRIMARY KEY (scenario_id, user_id);`,
    );
  }
}
