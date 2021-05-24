import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenariosPuCostData1621843948965 implements MigrationInterface {
  name = 'ScenariosPuCostData1621843948965';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * backward compatibility; can probably removed in another migration
     */
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_cost_data" ALTER COLUMN "cost" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_cost_data" ALTER COLUMN "cost" SET NOT NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "scenarios_pu_cost_data"."cost" IS 'By default we will set them as unitary based on equal area'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_cost_data" ALTER COLUMN "cost" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_cost_data" ALTER COLUMN "cost" DROP DEFAULT`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "scenarios_pu_cost_data"."cost" IS NULL`,
    );
  }
}
