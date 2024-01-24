import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddToBeRemovedColumnLegacyProjectImport1654505136527
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE legacy_project_imports
    ADD COLUMN to_be_removed boolean not null default false;
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE legacy_project_imports
    DROP COLUMN to_be_removed;
  `);
  }
}
