import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLargeDataStorage1628277511111 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    -- Change the storage type
    ALTER TABLE features_data
      ALTER COLUMN the_geom
      SET STORAGE EXTERNAL;

    -- Force the column to rewrite
    UPDATE features_data
      SET the_geom = ST_SetSRID(the_geom, 4326);

    -- Change the storage type
    ALTER TABLE wdpa
      ALTER COLUMN the_geom
      SET STORAGE EXTERNAL;

    -- Force the column to rewrite
    UPDATE wdpa
      SET the_geom = ST_SetSRID(the_geom, 4326);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    -- Change the storage type
    ALTER TABLE features_data
      ALTER COLUMN the_geom
      SET STORAGE MAIN;

    -- Force the column to rewrite
    UPDATE features_data
      SET the_geom = ST_SetSRID(the_geom, 4326);

    -- Change the storage type
    ALTER TABLE wdpa
      ALTER COLUMN the_geom
      SET STORAGE MAIN;

    -- Force the column to rewrite
    UPDATE wdpa
      SET the_geom = ST_SetSRID(the_geom, 4326);
      `);
  }
}
