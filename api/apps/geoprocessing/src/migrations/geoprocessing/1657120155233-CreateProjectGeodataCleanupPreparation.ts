import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectGeodataCleanupPreparation1657182655233
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE project_geodata_cleanup_preparation (
            project_id uuid PRIMARY KEY
          );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE project_geodata_cleanup_preparation;
    `);
  }
}
