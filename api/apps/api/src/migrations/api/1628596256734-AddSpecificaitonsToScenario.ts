import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpecificaitonsToScenario1628596256734
  implements MigrationInterface {
  name = 'AddSpecificaitonsToScenario1628596256734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenarios" ADD "candidate_specification_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "scenarios" ADD "active_specification_id" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenarios" DROP COLUMN "active_specification_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scenarios" DROP COLUMN "candidate_specification_id"`,
    );
  }
}
