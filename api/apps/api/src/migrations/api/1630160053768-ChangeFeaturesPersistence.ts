import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFeaturesPersistence1630160053768
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table specification_feature_configs add column features jsonb default '[]';
      drop table specification_features;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table specification_feature_configs drop column features;
    `);
    await queryRunner.query(
      `CREATE TABLE "specification_features" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "specification_feature_config_id" uuid NOT NULL, "feature_id" uuid NOT NULL, "calculated" boolean NOT NULL, CONSTRAINT "PK_8130e0e87aad71c16cad7f72b74" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "specification_features" ADD CONSTRAINT "FK_fa7a0488333e7eba2062cb25f3c" FOREIGN KEY ("specification_feature_config_id") REFERENCES "specification_feature_configs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
