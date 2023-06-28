import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArtifactCacheTable1687796245859 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cost_surface_file_cache"`);
    await queryRunner.query(
      `DROP TYPE "cost_surface_file_cache_artifactType_enum"`,
    );

    await queryRunner.query(`
      CREATE TYPE "artifact_cache_artifact_type_enum" AS ENUM('ProjectTemplate');
    `);
    await queryRunner.query(`
      CREATE TABLE "artifact_cache" (
          "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          "project_id" uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
          "artifact" oid,
          "artifact_type" "artifact_cache_artifact_type_enum" NOT NULL,
          "content_type" character varying NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "last_modified_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX ON "artifact_cache" ("project_id", "artifact_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "artifact_cache_project_id_artifact_type_idx";`,
    );
    await queryRunner.query(`DROP TABLE "artifact_cache"`);
    await queryRunner.query(`DROP TYPE "artifact_cache_artifact_type_enum"`);
  }
}
