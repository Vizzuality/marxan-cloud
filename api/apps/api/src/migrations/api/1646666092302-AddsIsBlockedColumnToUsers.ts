import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddsIsBlockedColumnToUsers1646666092302
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE users
            ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;
    `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE users
            DROP COLUMN is_blocked;
          `,
    );
  }
}
