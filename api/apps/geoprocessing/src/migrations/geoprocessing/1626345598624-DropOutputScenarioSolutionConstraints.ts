import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOutputScenarioSolutionConstraints1626345598624
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` ALTER TABLE output_scenarios_pu_data
        DROP CONSTRAINT scenario_pufk,
        DROP CONSTRAINT value_out_chk;`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
