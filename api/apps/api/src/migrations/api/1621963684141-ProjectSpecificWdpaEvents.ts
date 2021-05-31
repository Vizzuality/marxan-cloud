import { MigrationInterface, QueryRunner } from 'typeorm';

export class CostSurfaceEvents1621963684141 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('project.protectedAreas.submitted/v1/alpha'),
      ('project.protectedAreas.finished/v1/alpha'),
      ('project.protectedAreas.failed/v1/alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id like 'project.protectedAreas.%';`,
    );
  }
}
