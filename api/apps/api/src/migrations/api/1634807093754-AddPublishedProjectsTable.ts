import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublishedProjectsTable1634807093754
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "published_projects"
                             (
                               "id"          uuid              NOT NULL,
                               "name"        character varying NOT NULL,
                               "description" text,
                               CONSTRAINT "REL_50b117f602b62155ceacac2fde" UNIQUE ("id"),
                               CONSTRAINT "PK_50b117f602b62155ceacac2fde3" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "published_projects"
      ADD CONSTRAINT "published_projects_id_fkey" FOREIGN KEY ("id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "is_public"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "published_projects" DROP CONSTRAINT "published_projects_id_fkey"`,
    );
    await queryRunner.query(`DROP TABLE "published_projects"`);
    await queryRunner.query(`ALTER TABLE "projects"
      ADD "is_public" boolean NOT NULL DEFAULT false`);
  }
}
