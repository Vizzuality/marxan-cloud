import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgreSQLUtils } from '@marxan-geoprocessing/utils/postgresql.utils';

export class AddFeatureScenarioOutputEntity1611828857842
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Only CREATEDB privilege required in 13+ rather than SUPERUSER (ht @agnessa)
    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
      ALTER TABLE scenario_features_data
      ADD COLUMN target_met float8,
      ADD COLUMN metadata jsonb;

      `);
    } else {
      Logger.warn(
        'The PostgreSQL extension `pgcrypto` is needed for the Marxan API but it was not possible to activate it. Please activate it manually (see setup documentation).',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
        ALTER TABLE scenario_features_data
        DROP COLUMN target_met,
        DROP COLUMN metadata;
        `);
    }
  }
}
