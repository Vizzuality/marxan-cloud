import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScenarioToAPICostSurfaceRelationship1693306147084
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO cost_surfaces (project_id , "name", min, max )
        SELECT project_id , name , 1 , 10
        FROM scenarios;
        -- min and max are random values because they can only calculated from the data on geoDB, and it's not possible on this migration file

        ALTER TABLE scenarios ADD COLUMN cost_surface_id uuid REFERENCES cost_surfaces(id);

        UPDATE scenarios s SET cost_surface_id = cs.id from cost_surfaces cs WHERE cs.name = s.name;

        ALTER TABLE scenarios ALTER COLUMN cost_surface_id set NOT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE scenarios DROP COLUMN cost_surface_id;
      `);
  }
}
