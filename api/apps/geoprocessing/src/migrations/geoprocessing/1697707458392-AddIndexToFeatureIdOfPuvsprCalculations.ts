import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToFeatureIdOfPuvsprCalculations1697707458392
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX puvspr_calculations_feature_id__idx ON "puvspr_calculations" ("feature_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX puvspr_calculations_feature_id__idx`);
  }
}
