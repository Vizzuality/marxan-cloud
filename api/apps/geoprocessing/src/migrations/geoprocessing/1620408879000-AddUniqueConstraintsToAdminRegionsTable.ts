import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintsToAdminRegionsTable1620408879000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE UNIQUE INDEX unique_l0_regions ON admin_regions (gid_0, level) where level = 'country';
CREATE UNIQUE INDEX unique_l1_regions ON admin_regions (gid_1, level) where level = 'adm_1';
CREATE UNIQUE INDEX unique_l2_regions ON admin_regions (gid_2, level) where level = 'adm_2';
CREATE INDEX admin_regions_l012_ids ON admin_regions (gid_0, gid_1, gid_2, level);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP INDEX unique_l0_regions;
DROP INDEX unique_l1_regions;
DROP INDEX unique_l2_regions;
DROP INDEX admin_regions_l012_ids;
     `);
  }
}
