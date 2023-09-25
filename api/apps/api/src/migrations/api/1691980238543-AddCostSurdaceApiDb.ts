import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCostSurfaceApiDb1691980238543 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE cost_surfaces (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id uuid NOT NULL references projects(id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      min float8 NOT NULL,
      max float8 NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      last_modified_at timestamp without time zone NOT NULL DEFAULT now(),
      CHECK (name <> '')
    );

    ALTER TABLE cost_surfaces
    ADD CONSTRAINT UQ_cost_surface_name_for_project UNIQUE (project_id, name);

    CREATE UNIQUE INDEX IDX_default_cost_surface_for_project
    ON cost_surfaces (project_id)
    WHERE is_default = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP TABLE cost_surfaces;
    `);
  }
}
