import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCleanUpPreparationTables1659439420578
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE project_geodata_cleanup_preparation
        RENAME TO dangling_projects;
    `);

    await queryRunner.query(`
        ALTER TABLE scenario_geodata_cleanup_preparation
        RENAME TO dangling_scenarios;
    `);

    await queryRunner.query(`
        ALTER TABLE features_data_cleanup_preparation
        RENAME TO dangling_features;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE dangling_projects
        RENAME TO project_geodata_cleanup_preparation;
    `);

    await queryRunner.query(`
        ALTER TABLE dangling_scenarios
        RENAME TO scenario_geodata_cleanup_preparation;
    `);

    await queryRunner.query(`
        ALTER TABLE dangling_features
        RENAME TO features_data_cleanup_preparation;
    `);
  }
}
