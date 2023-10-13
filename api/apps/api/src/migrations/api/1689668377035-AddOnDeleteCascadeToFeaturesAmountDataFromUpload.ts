import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteCascadeToFeaturesAmountDataFromUpload1689668377035
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE features_amounts
        DROP CONSTRAINT features_amounts_upload_id_fkey,
        ADD CONSTRAINT features_amounts_upload_id_fkey
        FOREIGN KEY (upload_id)
        REFERENCES feature_upload_registry(id)
        ON DELETE CASCADE;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE features_amounts
        DROP CONSTRAINT features_amounts_upload_id_fkey,
        ADD CONSTRAINT features_amounts_upload_id_fkey
        FOREIGN KEY (upload_id)
        REFERENCES feature_upload_registry(id);
      `);
  }
}
