import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeaturesSearchKvProps1630996003066 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index feature_properties_search_view_idx on feature_properties_kv (feature_id, key, bbox);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index feature_properties_search_view_idx;`);
  }
}
