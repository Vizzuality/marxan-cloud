import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureParentIdPropertiesColumn1652949715898
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE features
            ADD COLUMN parent_id uuid,
            ADD COLUMN parent_feature_props jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE features
            DROP COLUMN parent_id uuid,
            DROP COLUMN parent_feature_props jsonb;
    `);
  }
}
