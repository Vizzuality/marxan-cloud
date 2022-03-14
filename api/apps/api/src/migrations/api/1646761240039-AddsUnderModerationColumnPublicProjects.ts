import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddsUnderModerationColumnPublicProjects1646761240039
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE published_projects
            ADD COLUMN under_moderation boolean NOT NULL DEFAULT false;
    `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE published_projects
            DROP COLUMN under_moderation; 
          `,
    );
  }
}
