import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsPublicProject1650289574227
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE published_projects
        ADD COLUMN logo text,
        ADD COLUMN resources json[],
        ADD COLUMN creators json[];
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE published_projects
            DROP COLUMN logo,
            DROP COLUMN resources,
            DROP COLUMN creators;
    `);
  }
}
