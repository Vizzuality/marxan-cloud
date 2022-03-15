import { MigrationInterface, QueryRunner } from 'typeorm';

export class TotalAreaInScenarioOutputs1632468999736
  implements MigrationInterface
{
  name = 'TotalAreaInScenarioOutputs1632468999736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_features_data"
        ADD "total_area" double precision NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "output_scenarios_features_data"
        DROP COLUMN "total_area"`,
    );
  }
}
