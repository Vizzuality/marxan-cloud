import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectFileCacheTable1687796245859
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "cost_surface_file_cache_scenarioId_artifactType_idx";`,
    );
    await queryRunner.query(`DROP TABLE "cost_surface_file_cache"`);
    await queryRunner.query(
      `DROP TYPE "cost_surface_file_cache_artifactType_enum"`,
    );

    await queryRunner.query(`
      CREATE TYPE "project_template_file_cache_artifactType_enum" AS ENUM('ProjectTemplate');
    `);
    await queryRunner.query(`
      CREATE TABLE "project_template_file_cache" (
          "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          "projectId" uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
          "artifact" oid,
          "artifactType" "project_template_file_cache_artifactType_enum" NOT NULL,
          "contentType" character varying NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "lastModifiedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX ON "project_template_file_cache" ("projectId", "artifactType")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "project_template_file_cache_artifactType_enum";`,
    );
    await queryRunner.query(`DROP TABLE "project_template_file_cache"`);
    await queryRunner.query(
      `DROP TYPE "cost_surface_file_cache_artifactType_enum"`,
    );
  }
}
