import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStableIdsToFeaturesDataRows1708524274000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP TRIGGER tr_precompute_feature_property_list ON features_data;

CREATE TRIGGER tr_precompute_feature_property_list AFTER INSERT ON features_data
FOR EACH ROW EXECUTE
PROCEDURE precompute_feature_property_list();
      `);

    await queryRunner.query(`
ALTER TABLE features_data
ADD COLUMN stable_id uuid;

CREATE INDEX features_data_stable_id__idx ON features_data(stable_id);

CREATE UNIQUE INDEX features_data_unique_stable_ids_within_feature__idx ON features_data(feature_id, stable_id);
      `);

    await queryRunner.query(`
UPDATE features_data
SET stable_id = id;
      `);

    await queryRunner.query(`
ALTER TABLE features_data
ALTER COLUMN stable_id SET NOT NULL;

ALTER TABLE features_data
ALTER COLUMN stable_id SET DEFAULT gen_random_uuid();
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE features_data
DROP COLUMN stable_id;
      `);
  }
}
