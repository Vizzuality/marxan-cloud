import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtractDistictPropsFromFeatures1618853324000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
ALTER TABLE features_data
  RENAME COLUMN features_id TO feature_id;

CREATE OR REPLACE FUNCTION properties_for_feature(input uuid)
  RETURNS jsonb
  LANGUAGE plpgsql AS
$f$
  DECLARE
    _key   text;
    _value text;
    all_properties_across_feature_rows jsonb;
    result jsonb;
  BEGIN
    result := '{}'::jsonb;
    all_properties_across_feature_rows := (select properties from features_data where feature_id = input limit 1);
    FOR _key, _value IN
      SELECT * FROM jsonb_each_text(all_properties_across_feature_rows)
    LOOP
      result := result || jsonb_build_object(_key, array(select distinct properties -> _key from features_data where feature_id = input));
    END LOOP;

    RETURN result;
  END
$f$;

CREATE VIEW feature_properties AS
  SELECT DISTINCT
    feature_id,
    properties_for_feature(feature_id)
   FROM features_data;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
DROP VIEW feature_properties;

DROP FUNCTION properties_for_feature(input uuid);

ALTER TABLE features_data
  RENAME COLUMN feature_id TO features_id;
    `);
  }
}
