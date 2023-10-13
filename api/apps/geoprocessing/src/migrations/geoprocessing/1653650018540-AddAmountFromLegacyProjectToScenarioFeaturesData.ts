import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAmountFromLegacyProjectToScenarioFeaturesData1653916456540
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE scenario_features_data
        ADD COLUMN amount_from_legacy_project double precision;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE scenario_features_data
      DROP COLUMN amount_from_legacy_project;
  `);
  }
}
