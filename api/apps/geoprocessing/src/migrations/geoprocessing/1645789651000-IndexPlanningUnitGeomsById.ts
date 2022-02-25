import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncPlanningUnitGeomsById1645789651000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX planning_units_geom_id_idx ON planning_units_geom USING btree (id ASC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX planning_units_geom_id_idx;
    `);
  }
}
