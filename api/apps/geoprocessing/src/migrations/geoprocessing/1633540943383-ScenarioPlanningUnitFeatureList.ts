import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioPlanningUnitFeatureList1633540943383
  implements MigrationInterface
{
  name = 'ScenarioPlanningUnitFeatureList1633540943383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scenarios_pu_data"
      ADD "feature_list" text array NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scenarios_pu_data"
      DROP COLUMN "feature_list"`);
  }
}
