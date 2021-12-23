import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScenarioLocksTable1638891599444 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "scenario_locks" (
              scenario_id uuid NOT NULL,
              user_id uuid NOT NULL,
              created_at TIMESTAMP DEFAULT now()
             );`,
    );

    await queryRunner.query(
      `ALTER TABLE "scenario_locks" ADD CONSTRAINT scenario_locks_fk FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE;`,
    );

    await queryRunner.query(
      `ALTER TABLE "scenario_locks" ADD CONSTRAINT scenario_locks_fk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`,
    );

    await queryRunner.query(
      `ALTER TABLE "scenario_locks" ADD CONSTRAINT scenario_locks_pk PRIMARY KEY (scenario_id, user_id);`,
    );

    await queryRunner.query(
      `ALTER TABLE "scenario_locks" ADD CONSTRAINT scenario_locks_un UNIQUE (scenario_id);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenario_locks" DROP CONSTRAINT scenario_locks_un;`,
    );

    await queryRunner.query(
      `ALTER TABLE "scenario_locks" DROP CONSTRAINT scenario_locks_pk;`,
    );

    await queryRunner.query(
      `ALTER TABLE "scenario_locks" DROP CONSTRAINT scenario_locks_fk_1;`,
    );

    await queryRunner.query(
      `ALTER TABLE "scenario_locks" DROP CONSTRAINT scenario_locks_fk;`,
    );

    await queryRunner.query(`DROP TABLE "scenario_locks";`);
  }
}
