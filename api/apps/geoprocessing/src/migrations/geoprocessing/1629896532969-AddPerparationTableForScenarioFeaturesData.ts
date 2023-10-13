import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerparationTableForScenarioFeaturesData1629896532969
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table scenario_features_preparation (like scenario_features_data including all);
      alter table scenario_features_preparation drop column feature_id;
      drop index scenario_features_preparation_feature_class_id_idx,
        scenario_features_preparation_scenario_id_idx;
      create index scenario_features_preparation__specification_id__idx on scenario_features_preparation(specification_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table scenario_features_preparation;
    `);
  }
}
