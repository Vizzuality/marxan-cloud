import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFailedColumnToMarxanExecutionMetadata1627643811485
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marxan_execution_metadata" ADD "failed" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "marxan_execution_metadata" DROP COLUMN "failed"`,
    );
  }
}
