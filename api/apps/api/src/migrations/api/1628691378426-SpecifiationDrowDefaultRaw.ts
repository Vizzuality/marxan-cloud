import { MigrationInterface, QueryRunner } from 'typeorm';

export class SpecifiationDrowDefaultRaw1628691378426
  implements MigrationInterface
{
  name = 'SpecifiationDrowDefaultRaw1628691378426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "specifications" ALTER COLUMN "raw" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "specifications" ALTER COLUMN "raw" SET DEFAULT '{}'`,
    );
  }
}
