import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureScenarioOutputEntity1611828857842
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenario_features_data
ADD COLUMN target_met float8,
ADD COLUMN metadata jsonb;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE scenario_features_data
DROP COLUMN target_met,
DROP COLUMN metadata;
`);
  }
}
