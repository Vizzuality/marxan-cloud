import { MigrationInterface, QueryRunner } from 'typeorm';

export class OutputScenariosPuDataAggregate1626682903111
  implements MigrationInterface {
  name = 'OutputScenariosPuDataAggregate1626682903111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "output_scenarios_pu_data_idx"`);
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" DROP COLUMN "run_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" ADD "included_count" bigint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" DROP COLUMN "value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" ADD "value" boolean array NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" ALTER COLUMN "included_count" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" DROP COLUMN "value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" ADD "value" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" DROP COLUMN "included_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_pu_data" ADD "run_id" integer`,
    );
  }
}
