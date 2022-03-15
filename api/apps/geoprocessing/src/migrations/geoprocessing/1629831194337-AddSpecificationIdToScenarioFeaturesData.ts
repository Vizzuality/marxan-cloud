import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpecificationIdToScenarioFeaturesData1629831194337
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE scenario_features_data ADD COLUMN specification_id uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE scenario_features_data DROP COLUMN specification_id;
    `);
  }
}
