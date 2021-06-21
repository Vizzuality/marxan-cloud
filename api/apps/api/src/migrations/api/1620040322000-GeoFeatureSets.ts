import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeoFeatureSets1620040322000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenarios
  ADD COLUMN feature_set jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenarios
  DROP COLUMN feature_set;
    `);
  }
}
