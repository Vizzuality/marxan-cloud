import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPuvsprCalculationsTable1655819134885
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "puvspr_calculations"(
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "feature_id" uuid NOT NULL,
        "pu_id" integer NOT NULL,
        "amount" double precision NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "puvspr_calculations";');
  }
}
