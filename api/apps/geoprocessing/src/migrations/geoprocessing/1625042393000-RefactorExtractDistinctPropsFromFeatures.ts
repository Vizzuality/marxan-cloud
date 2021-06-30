import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorExtractDistinctPropsFromFeatures1625042393000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP VIEW
 feature_properties;
DROP FUNCTION properties_for_feature(input uuid);

CREATE TABLE feature_properties (
  feature_id uuid,
  feature_data_id uuid REFERENCES features_data(id) ON UPDATE CASCADE ON DELETE CASCADE,
  key text,
  value jsonb,
  bbox geometry,
  UNIQUE (feature_data_id, key, value)
);

CREATE INDEX idx_feature_properties_feature_id ON feature_properties(feature_id);
CREATE INDEX idx_feature_properties_feature_data_id ON feature_properties(feature_data_id);
CREATE INDEX idx_feature_properties_key ON feature_properties(key);
-- @todo add index to speed up filtering by geo intersection

INSERT INTO feature_properties
SELECT feature_id, id, (jsonb_each(properties)).key, (jsonb_each(properties)).value, ST_Envelope(the_geom) FROM features_data;

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No need to revert to the previous implementation - it was ill-conceived,
    // period. My fault, apologies.
  }
}
