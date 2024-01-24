import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioPlanningUnitInclusionEvents1623159171726
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.planningUnitsInclusion.submitted/v1alpha'),
      ('scenario.planningUnitsInclusion.failed/v1alpha'),
      ('scenario.planningUnitsInclusion.finished/v1alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id like 'scenario.planningUnitsInclusion.%';`,
    );
  }
}
