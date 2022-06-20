import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryColumnUsers1655731147185 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE users
            ADD COLUMN country varchar;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE users
            DROP COLUMN country;
    `)
  }
}
