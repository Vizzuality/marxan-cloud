import { MigrationInterface, QueryRunner } from 'typeorm';

export class WdpaGeometryUniqueness1637668828023 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    create unique index wpdpa_project_geometries_project_check on wdpa(coalesce(wdpaid, -1), hash, coalesce(project_id, '00000000-0000-0000-0000-000000000000'))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `drop index wpdpa_project_geometries_project_check`,
    );
  }
}
