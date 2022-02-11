import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUniquenessOfCustomProtectedAreas1643983434000
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- this previous index was enforcing uniqueness across WDPA and custom areas
drop index wpdpa_project_geometries_project_check;
-- we now split into two:
-- an unique index on custom areas (we don't want identical geometries, via hash
-- as proxy, within each project)
create unique index unique_custom_protected_area_geometries_per_project on wdpa (project_id, hash);
-- but for WDPA areas, we keep the previous constraint (no duplicated geometries
-- with identical wdpaid from WDPA database)
create unique index unique_wdpa_areas on wdpa(wdpaid, hash) where project_id is null;
-- and finally, we need a constraint from the unique index on custom areas,
-- as we rely on this for upserting
alter table wdpa add constraint unique_custom_protected_area_geometries_per_project unique using index unique_custom_protected_area_geometries_per_project;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
alter table wdpa drop constraint unique_custom_protected_area_geometries_per_project;
drop index unique_wdpa_areas;
create unique index wpdpa_project_geometries_project_check on wdpa(coalesce(wdpaid, -1), hash, coalesce(project_id, '00000000-0000-0000-0000-000000000000'));
    `);
  }
}
