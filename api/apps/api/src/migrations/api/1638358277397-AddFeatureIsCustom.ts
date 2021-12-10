import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureIsCustom1638358277397 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table features add column is_custom boolean generated always as ( case when project_id is null then false else true end) stored;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table features drop column is_custom;`,
    );
  }
}
