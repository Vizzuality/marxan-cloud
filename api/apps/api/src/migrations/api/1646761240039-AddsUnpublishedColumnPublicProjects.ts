import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddsIsBlockedColumnToUsers1646666092302
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE published_projects
            ADD COLUMN is_unpublished boolean NOT NULL DEFAULT false;
    `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE published_projects
            DROP COLUMN is_unpublished; 
          `,
    );
  }
}
