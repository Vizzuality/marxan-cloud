import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropNotNullsOnTimeUserMetadataColumns1619711501000
  implements MigrationInterface
{
  private tablesToAlter = ['admin_regions', 'scenario_features_data', 'wdpa'];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      this.tablesToAlter.map((table) => {
        queryRunner.query(`
ALTER TABLE ${table}
  ALTER COLUMN created_at DROP NOT NULL,
  ALTER COLUMN last_modified_at DROP NOT NULL,
  ALTER COLUMN created_by DROP NOT NULL;
`);
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all(
      this.tablesToAlter.map(async (table) => {
        /**
         * We first set the created_by column to the zero UUID where it is null so
         * that the following ALTER TABLE can succeed. There is no referential
         * integrity here at play as the users table is in a separate db and we
         * don't use FDWs at this stage.
         */
        await queryRunner.query(`
UPDATE ${table}
  SET created_by = '00000000-0000-0000-0000-000000000000'
  WHERE created_by IS NULL;

ALTER TABLE ${table}
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN last_modified_at SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL;
`);
      }),
    );
  }
}
