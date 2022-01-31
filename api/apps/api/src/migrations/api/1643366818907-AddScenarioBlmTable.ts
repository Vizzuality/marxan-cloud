import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScenarioBlmTable1643366818907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "scenario_blms"
                             (
                               "id"                 uuid               NOT NULL,
                               "values"             decimal[]          NOT NULL,
                               "defaults"           decimal[]          NOT NULL,
                               "range"              decimal[2]         NOT NULL,
                               "created_at"         timestamptz        DEFAULT now(),
                               "last_modified_at"   timestamptz        DEFAULT now(),
                               "created_by"         uuid,
                               CONSTRAINT "REL_46b117f602b62155ceacac2fd9" UNIQUE ("id"),
                               CONSTRAINT "PK_46b117f602b62155ceacac2fde9" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "scenario_blms"
      ADD CONSTRAINT "scenario_id_fkey" FOREIGN KEY ("id") REFERENCES "scenarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scenario_blms" DROP CONSTRAINT "scenario_id_fkey"`,
    );
    await queryRunner.query(`DROP TABLE "scenario_blms"`);
  }
}
