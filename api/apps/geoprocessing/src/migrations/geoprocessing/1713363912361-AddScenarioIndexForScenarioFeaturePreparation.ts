import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScenarioIndexForScenarioFeaturePreparation1713363912361
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX scenario_features_preparation_scenario_id__idx ON scenario_features_preparation(scenario_id);
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX scenario_features_preparation_scenario_id__idx;`,
    );
  }
}
