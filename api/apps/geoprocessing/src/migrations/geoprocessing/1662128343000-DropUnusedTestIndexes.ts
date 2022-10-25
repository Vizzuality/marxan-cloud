import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUnusedTestIndexes1662128343000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // As far as I can see we don't really rely on these indexes
    await queryRunner.query(`
      drop index test_features_data_btree_com2;
      drop index test__scenario_features_data_hash_index;
      drop index test_features_data_hash_index;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX test_features_data_hash_index ON features_data USING hash(id);
      CREATE INDEX test__scenario_features_data_hash_index ON scenario_features_data USING hash(feature_class_id);
      CREATE INDEX test_features_data_btree_com2 ON features_data USING btree (id, feature_id);
    `);
  }
}
