import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdexesFeaturesVTiles1629896555555
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE INDEX scenario_features_data_index_btree ON public.scenario_features_data USING btree (feature_id, scenario_id);
    CREATE INDEX test_features_data_hash_index ON features_data USING hash(id);
    CREATE INDEX test__scenario_features_data_hash_index ON scenario_features_data USING hash(feature_class_id);
    CREATE INDEX test_features_data_btree_com2 ON features_data USING btree (id, feature_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop index scenario_features_data_index;
      drop index test_features_data_hash_index;
      drop index test__scenario_features_data_hash_index;
      drop index test_features_data_btree_com2;
    `);
  }
}
