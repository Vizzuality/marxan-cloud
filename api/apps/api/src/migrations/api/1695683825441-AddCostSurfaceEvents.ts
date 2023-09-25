import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCostSurfaceEvents1695683825441 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
        ('project.costSurface.shapefile.submitted/v1alpha1'),
        ('project.costSurface.shapefile.finished/v1alpha1'),
        ('project.costSurface.shapeConverted/v1alpha1'),
        ('project.costSurface.shapeConversionFailed/v1alpha1'),
        ('project.costSurface.shapefile.failed/v1alpha1');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       DELETE FROM api_event_kinds WHERE id IN
        ('project.costSurface.shapefile.submitted/v1alpha1',
         'project.costSurface.shapefile.finished/v1alpha1',
         'project.costSurface.shapeConverted/v1alpha1',
         'project.costSurface.shapeConversionFailed/v1alpha1',
         'project.costSurface.shapefile.failed/v1alpha1'
        );
   `);
  }
}
