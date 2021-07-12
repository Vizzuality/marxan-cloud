import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorExtractDistinctPropsFromFeatures1625042393000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP VIEW
 feature_properties;
DROP FUNCTION properties_for_feature(input uuid);

CREATE TABLE feature_properties_kv (
  feature_id uuid,
  feature_data_id uuid REFERENCES features_data(id) ON UPDATE CASCADE ON DELETE CASCADE,
  key text,
  value jsonb,
  bbox geometry,
  UNIQUE (feature_data_id, key, value)
);

CREATE INDEX feature_properties_kv_feature_id__idx ON feature_properties_kv(feature_id);
CREATE INDEX feature_properties_kv_feature_data_id__idx ON feature_properties_kv(feature_data_id);
CREATE INDEX feature_properties_kv_key__idx ON feature_properties_kv(key);
-- @todo add index to speed up filtering by geo intersection
`);

    await queryRunner.query(`
INSERT INTO feature_properties_kv
SELECT feature_id, id, (jsonb_each(properties)).key, (jsonb_each(properties)).value, ST_Envelope(the_geom) FROM features_data;

CREATE OR REPLACE FUNCTION precompute_feature_property_list()
  RETURNS TRIGGER AS $BODY$
  BEGIN
    DELETE FROM feature_properties_kv
      WHERE feature_data_id = NEW.id;

    INSERT INTO feature_properties_kv
      SELECT feature_id, id, (jsonb_each(properties)).key, (jsonb_each(properties)).value, ST_Envelope(the_geom)
      FROM features_data
      WHERE id = NEW.id;

    RETURN NULL;
  END
$BODY$ LANGUAGE plpgsql;

CREATE TRIGGER tr_precompute_feature_property_list
  AFTER INSERT OR UPDATE ON features_data
  FOR EACH ROW EXECUTE
  PROCEDURE precompute_feature_property_list();

CREATE VIEW feature_properties AS
  SELECT feature_id, key, array_agg(distinct value) as value, bbox
  FROM feature_properties_kv
  GROUP BY feature_id, key, bbox;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No need to revert to the previous implementation - it was ill-conceived,
    // period. My fault, apologies.
  }
}
