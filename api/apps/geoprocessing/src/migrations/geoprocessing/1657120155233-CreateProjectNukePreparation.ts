import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectNukePreparation1657182655233
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE project_nuke_preparation (
            project_id uuid PRIMARY KEY,
          );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE project_nuke_preparation;
    `);
  }
}
