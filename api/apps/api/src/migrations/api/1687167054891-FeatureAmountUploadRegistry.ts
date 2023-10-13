import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeatureAmountUploadRegistry1687167054891
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE feature_upload_registry (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES projects(id),
                user_id UUID REFERENCES users(id),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    await queryRunner.query(`
    INSERT INTO api_event_kinds (id) values
      ('features.csv.import.submitted/v1/alpha'),
      ('features.csv.import.finished/v1/alpha'),
      ('features.csv.import.failed/v1/alpha')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE feature_amount_upload_registry;
        `);
  }
}
