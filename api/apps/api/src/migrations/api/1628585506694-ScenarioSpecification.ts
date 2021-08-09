import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioSpecification1628585506694 implements MigrationInterface {
  name = 'ScenarioSpecification1628585506694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "specification" ("id" uuid NOT NULL, "scenario_id" uuid NOT NULL, "draft" boolean NOT NULL, CONSTRAINT "PK_01b2d90197e187e3187b2d888be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "specification_feature" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "specification_feature_config_id" uuid NOT NULL, "feature_id" uuid NOT NULL, "calculated" boolean NOT NULL, CONSTRAINT "PK_fe6096ea6f25997b62b8a5c5f99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "specification_feature_config_operation_enum" AS ENUM('split', 'stratification', 'copy')`,
    );
    await queryRunner.query(
      `CREATE TABLE "specification_feature_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "specification_id" uuid NOT NULL, "base_feature_id" uuid NOT NULL, "against_feature_id" uuid, "operation" "specification_feature_config_operation_enum" NOT NULL, "features_determined" boolean NOT NULL, CONSTRAINT "PK_df1e25cf3972f83b1ff5bcb0337" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification" ADD CONSTRAINT "FK_2cecab1b81e5fa64f2fdbbaec76" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_feature" ADD CONSTRAINT "FK_ba3687896f22d3f57b3b570368e" FOREIGN KEY ("specification_feature_config_id") REFERENCES "specification_feature_config"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_feature_config" ADD CONSTRAINT "FK_1f1f9830fbe8a94ffd5c86d0bca" FOREIGN KEY ("specification_id") REFERENCES "specification"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "specification_feature_config" DROP CONSTRAINT "FK_1f1f9830fbe8a94ffd5c86d0bca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification_feature" DROP CONSTRAINT "FK_ba3687896f22d3f57b3b570368e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "specification" DROP CONSTRAINT "FK_2cecab1b81e5fa64f2fdbbaec76"`,
    );
    await queryRunner.query(`DROP TABLE "specification_feature_config"`);
    await queryRunner.query(
      `DROP TYPE "specification_feature_config_operation_enum"`,
    );
    await queryRunner.query(`DROP TABLE "specification_feature"`);
    await queryRunner.query(`DROP TABLE "specification"`);
  }
}
