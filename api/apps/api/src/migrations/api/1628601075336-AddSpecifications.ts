import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpecifications1628601075336 implements MigrationInterface {
  name = 'AddSpecifications1628601075336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "specifications" ("id" uuid NOT NULL, "scenario_id" uuid NOT NULL, "draft" boolean NOT NULL, CONSTRAINT "PK_621aabf71e640ab86f0e8b62a37" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "specification_features" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "specification_feature_config_id" uuid NOT NULL, "feature_id" uuid NOT NULL, "calculated" boolean NOT NULL, CONSTRAINT "PK_8130e0e87aad71c16cad7f72b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "specification_feature_configs_operation_enum" AS ENUM('split', 'stratification', 'copy')`,
    );
    await queryRunner.query(
      `CREATE TABLE "specification_feature_configs" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "specification_id" uuid NOT NULL, "base_feature_id" uuid NOT NULL, "against_feature_id" uuid, "operation" "specification_feature_configs_operation_enum" NOT NULL, "features_determined" boolean NOT NULL, CONSTRAINT "PK_3fd70f6b41ab03dba030a65cf46" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "specifications" ADD CONSTRAINT "FK_2ba43e90ec1fca5d28af773acfe" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_features" ADD CONSTRAINT "FK_fa7a0488333e7eba2062cb25f3c" FOREIGN KEY ("specification_feature_config_id") REFERENCES "specification_feature_configs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_feature_configs" ADD CONSTRAINT "FK_74ce99bf8618807ba6125042242" FOREIGN KEY ("specification_id") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "specification_feature_configs" DROP CONSTRAINT "FK_74ce99bf8618807ba6125042242"`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_features" DROP CONSTRAINT "FK_fa7a0488333e7eba2062cb25f3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "specifications" DROP CONSTRAINT "FK_2ba43e90ec1fca5d28af773acfe"`,
    );
    await queryRunner.query(`DROP TABLE "specification_feature_configs"`);
    await queryRunner.query(
      `DROP TYPE "specification_feature_configs_operation_enum"`,
    );
    await queryRunner.query(`DROP TABLE "specification_features"`);
    await queryRunner.query(`DROP TABLE "specifications"`);
  }
}
