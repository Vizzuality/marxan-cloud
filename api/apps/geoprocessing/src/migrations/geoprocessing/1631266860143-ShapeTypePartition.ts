import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShapeTypePartition1631266860143 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `CREATE TABLE planning_units_geom_from_shapefile PARTITION OF planning_units_geom FOR VALUES IN ('from_shapefile');`,
    );
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`DROP TABLE planning_units_geom_from_shapefile;`);
  }
}
