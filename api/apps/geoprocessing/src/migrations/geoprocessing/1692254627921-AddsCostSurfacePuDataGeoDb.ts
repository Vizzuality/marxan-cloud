import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddsCostSurfacePuDataGeoDb1692254627921
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * @todo: Check how cascade deletes should work
     */
    await queryRunner.query(`
      CREATE TABLE cost_surface_pu_data (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        -- consider marking this as not null, as it is for projects, and maybe required for the GC
        cost_surface_id uuid NOT NULL,
        puid uuid NOT NULL REFERENCES projects_pu(id) ON DELETE CASCADE,
        cost float8 NOT NULL,
        -- modifying this as I need the change for tests
        UNIQUE (cost_surface_id, puid)


      );
     `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE cost_surface_pu_data;
      `);
  }
}
