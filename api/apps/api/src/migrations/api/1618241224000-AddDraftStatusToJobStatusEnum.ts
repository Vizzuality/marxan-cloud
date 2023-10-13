import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDraftStatusToJobStatusEnum1618241224000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TYPE job_status ADD VALUE 'draft';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    /**
     * Not dropping here the enum value that we add on the up side of the
     * migration. In practice, this will involve just too many steps (altering
     * references in all the columns that use this type before to switch over
     * to a new type without the 'draft' status) for it to be useful at this
     * stage of development.
     */
  }
}
