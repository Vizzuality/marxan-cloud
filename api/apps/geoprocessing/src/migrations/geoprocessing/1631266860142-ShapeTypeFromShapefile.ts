import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShapeTypeFromShapefile1631266860142 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `alter type shape_type add value 'from_shapefile';`,
    );
    // https://stackoverflow.com/questions/65130629/new-enum-values-must-be-committed-before-they-can-be-used
    await queryRunner.commitTransaction();
  }

  async down(_queryRunner: QueryRunner) {
    // see AddDraftStatusToJobStatusEnum1618241224000
  }
}
