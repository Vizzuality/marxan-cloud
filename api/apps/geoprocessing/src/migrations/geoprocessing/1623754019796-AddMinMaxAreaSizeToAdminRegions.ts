import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinMaxAreaSizeToAdminRegions1623754019796
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE admin_regions
            ADD COLUMN max_pu_area_size DOUBLE PRECISION GENERATED ALWAYS AS ( st_area(st_transform(the_geom, 3410))) STORED,
            ADD COLUMN min_pu_area_size DOUBLE PRECISION GENERATED ALWAYS AS ( st_area(st_transform(the_geom, 3410)) / 589824 ) STORED;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE admin_regions
          DROP COLUMN max_pu_area_size,
          DROP COLUMN min_pu_area_size;
    `);
  }
}
