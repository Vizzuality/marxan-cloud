import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenariosPuCostDataId1621847467456 implements MigrationInterface {
  name = 'ScenariosPuCostDataId1621847467456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_cost_data" ADD "scenarios_pu_data_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_cost_data" ADD CONSTRAINT "FK_21454fad6e954ba771262974ae7" FOREIGN KEY ("scenarios_pu_data_id") REFERENCES "scenarios_pu_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_cost_data" DROP CONSTRAINT "FK_21454fad6e954ba771262974ae7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_cost_data" DROP COLUMN "scenarios_pu_data_id"`,
    );
  }
}
