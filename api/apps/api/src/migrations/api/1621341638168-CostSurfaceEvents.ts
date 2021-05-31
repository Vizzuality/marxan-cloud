import { MigrationInterface, QueryRunner } from 'typeorm';

export class CostSurfaceEvents1621341638168 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

INSERT INTO api_event_kinds (id) values
('scenario.costSurface.submitted/v1alpha1'),
('scenario.costSurface.shapeConverted/v1alpha1'),
('scenario.costSurface.shapeConversionFailed/v1alpha1'),
('scenario.costSurface.costUpdateFailed/v1alpha1'),
('scenario.costSurface.finished/v1alpha1');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id like 'scenario.costSurface.%';`,
    );
  }
}
