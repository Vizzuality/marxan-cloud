import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioFeaturesView1619707772586 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.query(`
    create view scenario_features_view as
    select scenarios."id"                         as id,
                      features.id                 as featureid,
                      projects."id"               as projectid,
                      features.description,
                      features.tag,
                      features.feature_class_name as name
               from scenarios
                      join projects on (scenarios.project_id = projects."id")
                      join features on (features.project_id = projects."id")
                     ;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.query(`drop view scenario_features_view`);
  }
}
