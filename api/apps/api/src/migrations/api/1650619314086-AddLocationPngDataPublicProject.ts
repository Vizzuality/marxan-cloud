import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationsPngDataPublicProject1650619314086
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE published_projects
        ADD COLUMN location varchar,
        ADD COLUMN png_data text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE published_projects
            DROP COLUMN location,
            DROP COLUMN png_data;
    `);
  }
}
