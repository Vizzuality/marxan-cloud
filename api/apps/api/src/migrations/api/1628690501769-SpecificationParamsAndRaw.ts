import { MigrationInterface, QueryRunner } from 'typeorm';

export class SpecificationParamsAndRaw1628690501769
  implements MigrationInterface
{
  name = 'SpecificationParamsAndRaw1628690501769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "specifications" ADD "raw" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_feature_configs" ADD "split_by_property" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_feature_configs" ADD "select_sub_sets" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "specification_feature_configs" DROP COLUMN "select_sub_sets"`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_feature_configs" DROP COLUMN "split_by_property"`,
    );
    await queryRunner.query(`ALTER TABLE "specifications" DROP COLUMN "raw"`);
  }
}
