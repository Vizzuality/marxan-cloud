import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEezToAdminRegions1654090110000

  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE adm_level ADD VALUE IF NOT EXISTS 'eez';

        CREATE TABLE IF NOT EXISTS admin_regions_eez PARTITION OF admin_regions FOR VALUES IN ('eez');

        ALTER TABLE admin_regions ADD COLUMN IF NOT EXISTS pol_type text,
                                  ADD COLUMN IF NOT EXISTS mrgid_eez integer;

        CREATE UNIQUE INDEX IF NOT EXISTS unique_eez_regions ON admin_regions (mrgid_eez, level) where level = 'eez';

        DROP INDEX admin_regions_l012_ids;

        CREATE INDEX admin_regions_l012_ids ON admin_regions (gid_0, gid_1, gid_2, mrgid_eez, level);
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE admin_regions
              DROP COLUMN pol_type,
              DROP COLUMN mrgid_eez;

          ALTER TABLE admin_regions DROP PARTITION admin_regions_eez;

          ALTER TYPE adm_level DROP VALUE IF EXISTS 'eez';
          DROP INDEX unique_eez_regions;
          CREATE INDEX admin_regions_l012_ids ON admin_regions (gid_0, gid_1, gid_2, level);

          `);
  }
}
