import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePuvsprCalculationsToFeatureAmountsPerPlanningUnit1697788481437
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
         ALTER TABLE puvspr_calculations
         RENAME TO feature_amounts_per_planning_unit;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
         ALTER TABLE feature_amounts_per_planning_unit
         RENAME TO puvspr_calculations;
      `);
  }
}
