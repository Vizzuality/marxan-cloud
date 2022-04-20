import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsPublicProject1650289574227
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE published_projects
        ADD COLUMN company jsonb,
        ADD COLUMN resources jsonb,
        ADD COLUMN creators jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE published_projects
            DROP COLUMN company,
            DROP COLUMN resources,
            DROP COLUMN creators;
    `);
  }
}
