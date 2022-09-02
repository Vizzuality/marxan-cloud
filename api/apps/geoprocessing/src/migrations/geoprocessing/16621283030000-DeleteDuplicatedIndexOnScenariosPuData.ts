import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteDuplicatedIndexOnScenariosPuData16621283030000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX scenarios_pu_data_scenario_id_idx;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No need to restore a duplicated index
  }
}
