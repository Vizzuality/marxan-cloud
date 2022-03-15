import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalUniqueIdToApiEvents1626458359147
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE api_events ADD external_id character varying`,
    );

    await queryRunner.query(
      `ALTER TABLE api_events ADD CONSTRAINT api_events_external_id_unique UNIQUE ("external_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE api_events DROP CONSTRAINT api_events_external_id_unique`,
    );
    await queryRunner.query(`ALTER TABLE api_events DROP COLUMN external_id`);
  }
}
