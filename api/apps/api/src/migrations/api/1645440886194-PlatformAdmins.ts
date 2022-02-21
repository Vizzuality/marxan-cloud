import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformAdmins1645440886194 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE platform_admins (
        user_id uuid not null references users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        PRIMARY KEY(user_id)
      );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE platform_admins;`);
  }
}
