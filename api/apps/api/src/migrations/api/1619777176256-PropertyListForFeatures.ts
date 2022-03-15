import { MigrationInterface, QueryRunner } from 'typeorm';

export class PropertyListForFeatures1619777176256
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE features
    ADD COLUMN list_property_keys jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
     ALTER TABLE features
     DROP COLUMN list_property_keys;
     `);
  }
}
