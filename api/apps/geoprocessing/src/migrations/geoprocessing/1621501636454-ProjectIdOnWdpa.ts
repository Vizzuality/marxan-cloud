import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectIdOnWdpa1621501636454 implements MigrationInterface {
  name = 'ProjectIdOnWdpa1621501636454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wdpa" ADD "project_id" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wdpa" DROP COLUMN "project_id"`);
  }
}
