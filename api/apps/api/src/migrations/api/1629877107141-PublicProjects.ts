import { MigrationInterface, QueryRunner } from 'typeorm';

export class PublicProjects1629877107141 implements MigrationInterface {
  name = 'PublicProjects1629877107141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects"
      ADD "is_public" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects"
      DROP COLUMN "is_public"`);
  }
}
