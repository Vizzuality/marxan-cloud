import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeoOperationHashAndGeoOperation1656497708461
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE features
            ADD COLUMN is_legacy boolean not null default false;`);

    await queryRunner.query(`
        ALTER TABLE features
            ADD COLUMN from_geoprocessing_ops jsonb;
    `);

    await queryRunner.query(`
        ALTER TABLE features
            ADD COLUMN geoprocessing_ops_hash text GENERATED ALWAYS AS (digest(from_geoprocessing_ops::text, 'sha256')) STORED;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE features
            DROP COLUMN is_legacy;
    `);

    await queryRunner.query(`
        ALTER TABLE features
            DROP COLUMN geoprocessing_ops_hash;
    `);

    await queryRunner.query(`
        ALTER TABLE features
            DROP COLUMN from_geoprocessing_ops;
    `);
  }
}
