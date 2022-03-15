import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastModifiedAtToSpecification1629195451410
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE specifications
  ADD COLUMN last_modified_at timestamp without time zone NOT NULL DEFAULT now();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE specifications
  DROP COLUMN last_modified_at;
    `);
  }
}
