import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResourceNameToImport1651751461137
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE imports
        ADD COLUMN resource_name TEXT;
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE imports
        DROP COLUMN resource_name;
      `,
    );
  }
}
