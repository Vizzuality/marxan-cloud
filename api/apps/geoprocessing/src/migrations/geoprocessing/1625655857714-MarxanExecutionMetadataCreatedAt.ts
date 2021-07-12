import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarxanExecutionMetadataCreatedAt1625655857714
  implements MigrationInterface {
  name = 'MarxanExecutionMetadataCreatedAt1625655857714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marxan_execution_metadata" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marxan_execution_metadata" DROP COLUMN "created_at"`,
    );
  }
}
