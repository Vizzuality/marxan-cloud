import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveAmountFromLegacyProjectToFeaturesData1659032419406
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE features_data
        ADD COLUMN amount_from_legacy_project double precision;
    `);

    await queryRunner.query(`
      ALTER TABLE scenario_features_data
        DROP COLUMN amount_from_legacy_project;
    `);

    await queryRunner.query(`
      ALTER TABLE features_data
        ADD COLUMN project_pu_id uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE features_data
        ADD FOREIGN KEY (project_pu_id) REFERENCES projects_pu(id) 
        ON DELETE cascade;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE scenario_features_data
        ADD COLUMN amount_from_legacy_project double precision;
    `);

    await queryRunner.query(`
      ALTER TABLE features_data
        DROP COLUMN amount_from_legacy_project;
    `);

    await queryRunner.query(`
      ALTER TABLE features_data
        DROP COLUMN project_pu_id;
    `);
  }
}
