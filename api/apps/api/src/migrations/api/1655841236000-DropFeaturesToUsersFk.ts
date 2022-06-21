import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropFeaturesToUsersFk1655841236000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE features
        DROP CONSTRAINT features_created_by_fkey;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE features
        ADD CONSTRAINT features_created_by_fkey
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL;
    `)
  }
}
