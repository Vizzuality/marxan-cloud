import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarxanExecutionMetadata1625494224067
  implements MigrationInterface {
  name = 'MarxanExecutionMetadata1625494224067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "marxan_execution_metadata" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "scenarioId" character varying NOT NULL, "std_out" character varying, "std_err" character varying, "input_zip" bytea NOT NULL, "output_zip" bytea, CONSTRAINT "PK_3926acd5285d86ad395507b5982" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b79bc69001704ab949eccbc082" ON "marxan_execution_metadata" ("scenarioId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_b79bc69001704ab949eccbc082"`);
    await queryRunner.query(`DROP TABLE "marxan_execution_metadata"`);
  }
}
