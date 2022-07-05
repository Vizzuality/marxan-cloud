import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExportIdToImport1655657559840 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        DELETE FROM imports;
      `,
    );
    await queryRunner.query(
      `
        ALTER TABLE imports
        ADD COLUMN export_id uuid NOT NULL;
      `,
    );

    await queryRunner.query(
      `
        ALTER TABLE imports 
        ADD FOREIGN KEY (export_id) 
        REFERENCES exports(id)
        ON DELETE CASCADE;
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE imports
        DROP COLUMN export_id;
      `,
    );
  }
}
