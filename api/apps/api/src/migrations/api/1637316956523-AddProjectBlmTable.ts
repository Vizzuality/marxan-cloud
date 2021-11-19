import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectBlmTable1637250496398 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "project_blms"
                             (
                               "id"          uuid               NOT NULL,
                               "values"      integer[]          NOT NULL,
                               "defaults"    integer[]          NOT NULL,
                               "range"       integer[2]         NOT NULL,
                               CONSTRAINT "REL_46b117f602b62155ceacac2fd6" UNIQUE ("id"),
                               CONSTRAINT "PK_46b117f602b62155ceacac2fde6" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "project_blms"
      ADD CONSTRAINT "project_id_fkey" FOREIGN KEY ("id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_blms" DROP CONSTRAINT "project_id_fkey"`,
    );
    await queryRunner.query(`DROP TABLE "project_blms"`);
  }
}
