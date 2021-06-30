import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorExtractDistinctPropsFromFeatures1625042393000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP VIEW
 feature_properties;
DROP FUNCTION properties_for_feature(input uuid);

create table feature_properties (
  feature_id uuid,
  feature_data_id uuid references features_data(id) on update cascade on delete cascade,
  key text,
  value jsonb,
  bbox geometry,
  unique (feature_data_id, key, value)
);

create index idx_feature_properties_feature_id on feature_properties(feature_id);
create index idx_feature_properties_feature_data_id on feature_properties(feature_data_id);
create index idx_feature_properties_key on feature_properties(key);
-- @todo add index to speed up filtering by geo intersection

insert into feature_properties
select feature_id, id, (jsonb_each(properties)).key, (jsonb_each(properties)).value, st_envelope(the_geom) from features_data;

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No need to revert to the previous implementation - it was ill-conceived,
    // period. My fault, apologies.
  }
}
