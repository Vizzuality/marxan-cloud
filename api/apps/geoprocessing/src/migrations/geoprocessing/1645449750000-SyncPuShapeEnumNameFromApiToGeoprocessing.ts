import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncPuShapeEnumNameFromApiToGeoprocessing1645449750000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE shape_type RENAME TO planning_unit_grid_shape;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE planning_unit_grid_shape RENAME TO shape_type;
    `);
  }
}
