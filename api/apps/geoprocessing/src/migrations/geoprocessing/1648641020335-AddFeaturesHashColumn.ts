import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectsPuPlanningAreaIdColumn1648641020335
  implements MigrationInterface {
  readonly defaultGeometry =
    '0103000020E610000001000000050000000000000088022BC01596661D3B4C3D4000000000EE232BC0F2A7E0E25C3B3D4000000000C2132BC0A1A5CF4A3B333D4000000000D3E42AC02875DF6406453D400000000088022BC01596661D3B4C3D40';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE features_data
        SET the_geom = '${this.defaultGeometry}'
        WHERE the_geom IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE features_data
        ALTER COLUMN the_geom SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE features_data 
        ADD COLUMN hash TEXT NOT NULL GENERATED ALWAYS AS (md5(the_geom::bytea::text || coalesce(properties, '{}')::text)) STORED;
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_feature_data_per_project ON features_data(hash, feature_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE features_data
	      ALTER COLUMN the_geom DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE features_data DROP COLUMN hash;
    `);
    await queryRunner.query(`
      DROP INDEX unique_feature_data_per_project;
    `);
  }
}
