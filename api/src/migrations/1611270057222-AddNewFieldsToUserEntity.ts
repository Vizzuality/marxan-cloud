import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewFieldsToUserEntity1611270057222
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE users
ADD COLUMN display_name varchar,
ADD COLUMN metadata jsonb,
ADD COLUMN is_active boolean default false,
ADD COLUMN is_deleted boolean default false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE users
DROP COLUMN display_name,
DROP COLUMN metadata,
DROP COLUMN is_active,
DROP COLUMN is_deleted;
    `);
  }
}
