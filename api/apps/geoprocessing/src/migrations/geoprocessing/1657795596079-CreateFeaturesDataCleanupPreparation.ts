import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeaturesDataCleanupPreparation1657795596079
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE features_data_cleanup_preparation (
                feature_id uuid PRIMARY KEY
              );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE features_data_cleanup_preparation;
        `);
  }
}
