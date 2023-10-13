import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScenarioGeodataCleanupPreparation1657182662302
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE scenario_geodata_cleanup_preparation (
            scenario_id uuid PRIMARY KEY
          );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE scenario_geodata_cleanup_preparation;
    `);
  }
}
