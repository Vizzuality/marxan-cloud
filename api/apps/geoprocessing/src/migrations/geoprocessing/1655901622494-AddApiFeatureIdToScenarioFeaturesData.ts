import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApiFeatureIdToScenarioFeaturesData1653916456540
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM scenario_features_data;
    `);

    await queryRunner.query(`
      ALTER TABLE scenario_features_data
      ADD COLUMN api_feature_id uuid NOT NULL;
    `);

    await queryRunner.query(`
      alter table scenario_features_preparation
      ADD COLUMN api_feature_id uuid NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE scenario_features_data
        DROP COLUMN api_feature_id;
      `,
    );

    await queryRunner.query(
      `
        ALTER TABLE scenario_features_preparation
        DROP COLUMN api_feature_id;
      `,
    );
  }
}
