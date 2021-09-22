import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCacheForCalculatedAreas1630490120035
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table areas_cache
      (
        total_area float8,
        current_pa float8,
        hash       text primary key
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table areas_cache;
    `);
  }
}
