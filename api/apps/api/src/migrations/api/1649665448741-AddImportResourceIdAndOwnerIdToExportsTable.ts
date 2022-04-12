import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImportResourceIdColumnAndOwnerIdColumnToExportsTable1649665448741
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE exports ADD COLUMN import_resource_id uuid NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE exports ADD COLUMN owner_id uuid NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE exports 
        ADD CONSTRAINT exports_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE exports DROP COLUMN import_resource_id;
    `);

    await queryRunner.query(`
    ALTER TABLE exports DROP COLUMN owner_id;
  `);
  }
}
