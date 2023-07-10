import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAmountColumnInFeaturesData1689003155444
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE features_data
  RENAME COLUMN amount_from_legacy_project TO amount;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE features_data
  RENAME COLUMN amount TO amount_from_legacy_project;
    `);
  }
}
