import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUniquenessOfCustomProtectedAreas1643983434000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
drop index wpdpa_project_geometries_project_check;
create unique index unique_custom_protected_area_geometries_per_project on wdpa (project_id, hash);
alter table wdpa add constraint unique_custom_protected_area_geometries_per_project unique using index unique_custom_protected_area_geometries_per_project;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
drop index unique_custom_protected_area_geometries_per_project;
create unique index wpdpa_project_geometries_project_check on wdpa(coalesce(wdpaid, -1), hash, coalesce(project_id, '00000000-0000-0000-0000-000000000000'));
    `);
  }
}
