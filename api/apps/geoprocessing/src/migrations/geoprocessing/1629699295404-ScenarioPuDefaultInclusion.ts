import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenarioPuDefaultInclusion1629699295404
  implements MigrationInterface
{
  name = 'ScenarioPuDefaultInclusion1629699295404';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scenarios_pu_data"
      ADD "protected_by_default" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenarios_pu_data" DROP COLUMN "protected_by_default"`,
    );
  }
}
