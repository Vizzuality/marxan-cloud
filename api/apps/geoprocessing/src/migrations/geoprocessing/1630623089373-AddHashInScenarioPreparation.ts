import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHashInScenarioPreparation1630623089373
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table scenario_features_preparation
        add column hash text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table scenario_features_preparation
        drop column hash;
    `);
  }
}
