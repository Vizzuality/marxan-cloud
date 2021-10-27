import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAvatar1614789533000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE users
  ADD COLUMN avatar_data_url text;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE users
  DROP COLUMN avatar_data_url;
`);
  }
}
