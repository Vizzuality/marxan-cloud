import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgreSQLUtils } from '@marxan-api/utils/postgresql.utils';

export class EnablePostgis1608149578000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
CREATE EXTENSION IF NOT EXISTS postgis;
      `);
    } else {
      Logger.warn(
        'The PostgreSQL extension `postgis` is needed for the Marxan API but it was not possible to activate it. Please activate it manually (see setup documentation).',
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
DROP EXTENSION IF EXISTS postgis;
      `);
    }
  }
}
