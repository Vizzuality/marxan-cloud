import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesForPuVSprQueries1627980508000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
create index scenario_features_data__scenario_id__idx on scenario_features_data(scenario_id);
create index scenarios_pu_data__scenario_id__idx on scenarios_pu_data(scenario_id);
create index scenario_features_data__feature_class_id__idx on scenario_features_data(feature_class_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
drop index scenario_features_data__scenario_id__idx;
drop index scenarios_pu_data__scenario_id__idx;
drop index scenario_features_data__feature_class_id__idx;
      `);
  }
}
