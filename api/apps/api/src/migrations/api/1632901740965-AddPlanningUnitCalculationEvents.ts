import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanningUnitCalculationEvents1632901740965
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('project.planningUnits.submitted/v1/alpha'),
      ('project.planningUnits.finished/v1/alpha'),
      ('project.planningUnits.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.planningUnits.submitted/v1/alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.planningUnits.finished/v1/alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'project.planningUnits.failed/v1/alpha';`,
    );
  }
}
