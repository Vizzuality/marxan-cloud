import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDBSetup1608149577000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email varchar NOT NULL,
      fname varchar,
      lname varchar,
      created_at timestamp
    );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
    DROP TABLE IF EXISTS users;
    `);
  }
}
