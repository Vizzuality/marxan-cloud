import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeometryHashToWdpa1637668828023 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    alter table wdpa add column hash text generated always as (md5(the_geom::bytea)) stored;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`alter table wdpa drop column hash;`);
  }
}
