import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApiFeatureIdToScenarioFeaturesData1653916456540
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE scenario_features_data
      ADD COLUMN api_feature_id uuid;
    `);

    await queryRunner.query(`
      update scenario_features_data 
      set api_feature_id = fd.feature_id 
        from scenario_features_data sfd 
        inner join features_data fd on fd.id = sfd.feature_class_id 
        where sfd.id = scenario_features_data.id;
    `);

    await queryRunner.query(
      `
      ALTER TABLE scenario_features_data ALTER COLUMN api_feature_id SET NOT NULL;
      `,
    );

    await queryRunner.query(`
      alter table scenario_features_preparation
      ADD COLUMN api_feature_id uuid;
    `);

    await queryRunner.query(`
      update scenario_features_preparation 
      set api_feature_id = (
        select fd.feature_id 
        from scenario_features_preparation sfp
        inner join features_data fd on fd.id = sfp.feature_class_id 
        where sfp.id = scenario_features_preparation.id
        );
    `);

    await queryRunner.query(
      `
      ALTER TABLE scenario_features_preparation ALTER COLUMN api_feature_id SET NOT NULL;
      `,
    );
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
