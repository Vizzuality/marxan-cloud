import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureTagTable1685458802957 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE project_feature_tags (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id uuid NOT NULL references projects(id) ON DELETE CASCADE,
      feature_id uuid NOT NULL references features(id) ON DELETE CASCADE,
      tag varchar NOT NULL,
      last_modified_at timestamp NOT NULL default now()
    );`);

    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_project_feature ON project_feature_tags (project_id, feature_id);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_project_tag ON project_feature_tags (project_id, LOWER(tag));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX unique_project_tag`);
    await queryRunner.query(`DROP INDEX unique_project_feature`);
    await queryRunner.query(`DROP TABLE project_feature_tags`);
  }
}
