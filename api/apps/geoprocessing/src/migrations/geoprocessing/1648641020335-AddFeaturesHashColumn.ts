import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectsPuPlanningAreaIdColumn1648641020335
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE features_data 
        ADD COLUMN hash TEXT NOT NULL GENERATED ALWAYS AS (md5(the_geom::bytea::text || properties::text)) STORED;
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_feature_data_per_project ON features_data(hash, feature_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE features_data DROP COLUMN hash;
    `);
    await queryRunner.query(`
      DROP INDEX unique_feature_data_per_project;
    `);
  }
}
