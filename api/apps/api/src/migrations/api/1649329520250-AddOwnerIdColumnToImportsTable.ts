import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerIdColumnToImportsTable1649329520250
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE imports ADD COLUMN owner_id uuid NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE imports 
        ADD CONSTRAINT imports_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE imports DROP COLUMN owner_id;
    `);
  }
}
