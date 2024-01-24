import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeatureAmountDataFromUpload1687167113641
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE features_amounts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                feature_name TEXT NOT NULL,
                amount FLOAT NOT NULL,
                puid INTEGER NOT NULL,
                upload_id UUID REFERENCES feature_upload_registry(id)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE uploaded_features;
        `);
  }
}
