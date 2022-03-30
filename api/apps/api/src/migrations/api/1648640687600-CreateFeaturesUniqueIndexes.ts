import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeaturesUniqueIndexes1648640687600
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_platform_features ON features (feature_class_name) WHERE project_id IS NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_project_features ON features (feature_class_name, project_id) WHERE project_id IS NOT NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      DROP INDEX unique_platform_features;
    `);
    await queryRunner.query(`
      DROP INDEX unique_project_features;
    `);
  }
}
