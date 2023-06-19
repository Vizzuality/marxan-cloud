import { MigrationInterface, QueryRunner } from 'typeorm';

export class StoreAmountOfFeaturePerPu1687278160000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
alter table scenarios_pu_data
  add column feature_amounts double precision[] not null default array[]::double precision[];
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
alter table scenarios_pu_data
  drop column feature_amounts;
    `);
  }
}
