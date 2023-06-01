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
      CREATE UNIQUE INDEX single_tag_on_project_features ON project_feature_tags (project_id, feature_id);
    `);

    // A trigger that will update the tag of the incoming insert to use a capitalization equivalent tag that already exists
    // for the same project
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION tr_equivalent_capitalization_tag()
    RETURNS TRIGGER AS $BODY$
    DECLARE
      equivalent_tag project_feature_tags.tag%type ;
      equivalent_tag_counter integer;
    BEGIN
      select count(*) into equivalent_tag_counter from project_feature_tags pft where LOWER(pft.tag) = LOWER(NEW.tag);
      IF equivalent_tag_counter >= 1 THEN
        select tag into equivalent_tag from project_feature_tags pft where LOWER(pft.tag) = LOWER(NEW.tag) limit 1;
        NEW.tag = equivalent_tag;
      ELSE
      END IF;

      RETURN NEW;
    end
    $BODY$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS tr_project_feature_tags_insert ON project_feature_tags;

    CREATE TRIGGER tr_project_feature_tags_insert
    BEFORE INSERT ON project_feature_tags
    FOR EACH ROW EXECUTE
    PROCEDURE tr_equivalent_capitalization_tag();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Indexes will be implicitly dropped with the table
    await queryRunner.query(`
        DROP TRIGGER IF EXISTS tr_project_feature_tags_insert on project_feature_tags;
        DROP FUNCTION IF EXISTS tr_equivalent_capitalization_tag();
        DROP TABLE project_feature_tags;
    `);
  }
}
