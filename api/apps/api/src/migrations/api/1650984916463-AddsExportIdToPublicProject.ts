import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddsExportIdToPublicProject1650984916463
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE published_projects
            ADD COLUMN export_id uuid;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE published_projects
                DROP COLUMN export_id;
        `);
  }
}
