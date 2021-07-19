import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRunAtLeastOnceFlagToScenario1625209470391
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE scenarios ADD "ran_at_least_once" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE scenarios DROP COLUMN "ran_at_least_once"`,
    );
  }
}
