import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCostSurfaceLinkingNewEvents1696603545456
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.costSurface.link.submitted/v1/alpha1'),
      ('scenario.costSurface.link.finished/v1/alpha1'),
      ('scenario.costSurface.link.failed/v1/alpha1');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.costSurface.link.submitted/v1/alpha1';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.costSurface.link.finished/v1/alpha1';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.costSurface.link.failed/v1/alpha1';`,
    );
  }
}
