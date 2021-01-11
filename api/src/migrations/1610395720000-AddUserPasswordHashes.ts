import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPasswordHashes1610395720000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
ALTER TABLE users ADD COLUMN password_hash varchar(64) NOT NULL DEFAULT uuid_generate_v4();
ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
ALTER TABLE users DROP COLUMN password_hash;
    `);
  }
}
