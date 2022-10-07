import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesForCascades1665146409000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index specification_feature_configs__specification_id__idx on specification_feature_configs (specification_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop index specification_feature_configs__specification_id__idx;
      );
    `);
  }
}
