import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShapeTypeFromShapefile1631266860142 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `alter type shape_type add value 'from_shapefile';`,
    );
  }

  async down(_queryRunner: QueryRunner) {
    // see AddDraftStatusToJobStatusEnum1618241224000
  }
}
