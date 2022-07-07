import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScenarioNukePreparation1657182662302
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE scenario_nuke_preparation (
            scenario_id uuid PRIMARY KEY
          );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE scenario_nuke_preparation;
    `);
  }
}
