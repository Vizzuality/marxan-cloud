import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStableIdsToCostSurfaces1710069730000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE cost_surfaces
ADD COLUMN stable_id uuid;

CREATE INDEX cost_surfaces_stable_id__idx ON cost_surfaces(stable_id);

CREATE UNIQUE INDEX cost_surfaces_unique_stable_ids_within_project__idx ON cost_surfaces(project_id, stable_id);
      `);

    await queryRunner.query(`
UPDATE cost_surfaces
SET stable_id = id;
      `);

    await queryRunner.query(`
ALTER TABLE cost_surfaces
ALTER COLUMN stable_id SET NOT NULL;

ALTER TABLE cost_surfaces
ALTER COLUMN stable_id SET DEFAULT gen_random_uuid();
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE cost_surfaces
DROP COLUMN stable_id;
      `);
  }
}
