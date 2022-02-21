import { MigrationInterface, QueryRunner } from 'typeorm';
import { Logger } from '@nestjs/common';
import { PostgreSQLUtils } from '@marxan-geoprocessing/utils/postgresql.utils';

export class FixUniquenessOfPuGeoms1641582332000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
          CREATE EXTENSION IF NOT EXISTS pgcrypto;
        `);
    } else {
      Logger.warn(
        'The PostgreSQL extension `pgcrypto` is needed for the Marxan Geoprocessing service, but it was not possible to activate it. Please activate it manually (see setup documentation).',
      );
    }

    /*
     * The previous implementation of the
     * `planning_units_geom_the_geom_type_project_id_check` index would not be
     * ok for `the_geom` data rows past the current limit for btrees (typical
     * errors: `index row size <NNN> exceeds btree version 4 maximum 2704 for
     * index "planning_units_geom_from_shapefile_the_geom_type_coalesce_idx")`,
     * so we are indexing a hash of `the_geom` here as a proxy of the content of
     * `the_geom` proper.
     *
     * md5 should be faster than alternative hashing functions such as sha2xx,
     * while functionally enough for the purpose: the uniqueness check here is
     * meant to avoid *routine* duplication of planning units, and we are not
     * considering this as part of a threat model where a malicious actor would
     * purposely want to forge collisions.
     *
     * No realistic chance of collision is expected through normal use of the
     * platform, and even if this were to happen, the outcome would be some
     * wasted storage space for *a specific* planning unit, therefore making
     * this computationally unattractive even for an hypothetic malicious actor.
     */
    await queryRunner.query(`
      drop index planning_units_geom_the_geom_type_project_id_check;

      alter table planning_units_geom add column the_geom_hash bytea generated always as (digest(the_geom::bytea, 'md5')) stored;

      create unique index planning_units_geom_the_geom_type_project_id_check
        on planning_units_geom(the_geom_hash, type, coalesce(project_id, '00000000-0000-0000-0000-000000000000'));
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop index planning_units_geom_the_geom_type_project_id_check;

      alter table planning_units_geom drop column the_geom_hash;

      create unique index planning_units_geom_the_geom_type_project_id_check
        on planning_units_geom(the_geom, type, coalesce(project_id, '00000000-0000-0000-0000-000000000000'));
    `);

    if (await PostgreSQLUtils.version13Plus()) {
      await queryRunner.query(`
          DROP EXTENSION IF EXISTS pgcrypto;
        `);
    } else {
      Logger.warn(
        'The PostgreSQL extension `pgcrypto` is not needed anymore for the Marxan Geoprocessing service, but it was not possible to drop it. Please drop it manually (see setup documentation).',
      );
    }
  }
}
