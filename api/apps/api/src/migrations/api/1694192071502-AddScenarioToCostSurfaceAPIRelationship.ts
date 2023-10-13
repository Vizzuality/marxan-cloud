import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScenarioToCostSurfaceAPIRelationship1694192071502
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE cost_surfaces ADD COLUMN is_migrated boolean DEFAULT false;
            ALTER TABLE scenarios ADD COLUMN cost_surface_id uuid REFERENCES cost_surfaces(id);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE cost_surfaces DROP COLUMN is_migrated ;
            ALTER TABLE scenarios DROP COLUMN cost_surface_id;`,
    );
  }
}
