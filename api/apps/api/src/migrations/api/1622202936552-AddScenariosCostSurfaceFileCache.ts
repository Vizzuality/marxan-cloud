import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScenariosCostSurfaceFileCache1622202936552
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "cost_surface_file_cache_artifactType_enum" AS ENUM('CostTemplate');
    `);
    await queryRunner.query(`
      CREATE TABLE "cost_surface_file_cache" (
          "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          "scenarioId" uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
          "artifact" oid,
          "artifactType" "cost_surface_file_cache_artifactType_enum" NOT NULL,
          "contentType" character varying NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "lastModifiedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX ON "cost_surface_file_cache" ("scenarioId", "artifactType")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "cost_surface_file_cache_scenarioId_artifactType_idx";`,
    );
    await queryRunner.query(`DROP TABLE "cost_surface_file_cache"`);
    await queryRunner.query(
      `DROP TYPE "cost_surface_file_cache_artifactType_enum"`,
    );
  }
}
