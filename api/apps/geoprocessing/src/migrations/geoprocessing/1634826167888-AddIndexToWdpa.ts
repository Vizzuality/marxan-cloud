import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToWdpa1634826167888 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index wdpa_project_id_idx on wdpa(project_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop index wdpa_project_id_idx;
    `);
  }
}
