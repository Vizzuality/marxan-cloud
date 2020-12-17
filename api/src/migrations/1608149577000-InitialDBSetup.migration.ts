import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDBSetup1608149577000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

    DROP EXTENSION IF EXISTS "uuid-ossp";
    `);
  }
}
